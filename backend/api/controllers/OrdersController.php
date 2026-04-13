<?php
// Set timezone to your local time (change as needed)
date_default_timezone_set('America/Grenada');

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/OrderItem.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Transaction.php';
require_once __DIR__ . '/../models/Notification.php';

class OrdersController {
    private $orderModel;
    private $orderItemModel;
    private $userModel;
    private $transactionModel;
    private $notificationModel;
    private $conn;

    private const OPERATIONAL_START = 8;
    private const OPERATIONAL_END = 16;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->orderModel = new Order($this->conn);
        $this->orderItemModel = new OrderItem($this->conn);
        $this->userModel = new User($this->conn);
        $this->transactionModel = new Transaction($this->conn);
        $this->notificationModel = new Notification($this->conn);
    }

    private function getUserId() {
        $headers = getallheaders();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
        return Security::verifyToken($token);
    }

    private function isWithinOperatingHours($timeStr) {
        if (!$timeStr) return false;
        $parts = explode(':', $timeStr);
        if (count($parts) < 2) return false;
        $hour = (int)$parts[0];
        return ($hour >= self::OPERATIONAL_START && $hour < self::OPERATIONAL_END);
    }

    public function getUserOrders() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        
        $orders = $this->orderModel->findByUserId($userId);
        foreach ($orders as &$order) {
            $order['id'] = (int)$order['id'];
            $order['total'] = (float)$order['total'];
            $order['user_id'] = (int)$order['user_id'];
            $order['order_date'] = $order['order_date'] ?? date('Y-m-d H:i:s');
            
            $items = $this->orderItemModel->findByOrderId($order['id']);
            foreach ($items as &$item) {
                $item['id'] = (int)$item['id'];
                $item['price'] = (float)$item['price'];
                $item['quantity'] = (int)$item['quantity'];
                $item['menu_item_id'] = (int)$item['menu_item_id'];
            }
            $order['items'] = $items;
        }
        Response::send(200, $orders);
    }

    public function get($id = null) {
        if (!$id) Response::send(400, ['error' => 'Order ID required']);
        try {
            $order = $this->orderModel->findById($id);
            if (!$order) Response::send(404, ['error' => 'Order not found']);
            
            $order['id'] = (int)$order['id'];
            $order['total'] = (float)$order['total'];
            $order['user_id'] = (int)$order['user_id'];
            $order['order_date'] = $order['order_date'] ?? date('Y-m-d H:i:s');
            
            $order['items'] = $this->orderItemModel->findByOrderId($id);
            foreach ($order['items'] as &$item) {
                $item['id'] = (int)$item['id'];
                $item['price'] = (float)$item['price'];
                $item['quantity'] = (int)$item['quantity'];
                $item['menu_item_id'] = (int)$item['menu_item_id'];
            }
            Response::send(200, $order);
        } catch (Exception $e) {
            Response::send(500, ['error' => 'Failed to retrieve order: ' . $e->getMessage()]);
        }
    }

    public function post() {
        // Try to get authenticated user ID, but not required for guest orders
        $userId = $this->getUserId();
        
        $input = Security::getJsonInput();
        if (!$input || !isset($input['items']) || !isset($input['total'])) {
            Response::send(400, ['error' => 'Invalid order data']);
        }

        // Map incoming cart items to the format expected by OrderItem::createBatch()
        // Include the options field if present
        $items = array_map(function($cartItem) {
            return [
                'id' => $cartItem['id'],
                'quantity' => $cartItem['quantity'],
                'price' => $cartItem['price'],
                'options' => $cartItem['options'] ?? null,   // <-- NEW: pass selected options
            ];
        }, $input['items']);

        $total = (float)$input['total'];
        $paymentMethod = isset($input['paymentMethod']) ? $input['paymentMethod'] : 'cash';
        $rawPickupTime = isset($input['pickupTime']) ? $input['pickupTime'] : null;
        
        // Customer details from checkout form
        $customerName = isset($input['customerName']) ? trim($input['customerName']) : null;
        $customerEmail = isset($input['customerEmail']) ? trim($input['customerEmail']) : null;
        $customerPhone = isset($input['customerPhone']) ? trim($input['customerPhone']) : null;

        // Handle optional pickup time
        $pickupTime = null; // default to NULL (ASAP)
        $isASAP = false;

        if (!empty($rawPickupTime) && $rawPickupTime !== 'ASAP') {
            // Validate the provided time
            if (!$this->isWithinOperatingHours($rawPickupTime)) {
                Response::send(400, ['error' => 'Pickup time must be between ' . self::OPERATIONAL_START . ':00 AM and ' . self::OPERATIONAL_END . ':00 PM.']);
            }
            // Build full datetime
            $pickupTime = date('Y-m-d') . ' ' . $rawPickupTime . ':00';
            $currentDateTime = new DateTime();
            $pickupDateTime = new DateTime($pickupTime);
            if ($pickupDateTime <= $currentDateTime) {
                Response::send(400, ['error' => 'Pickup time must be after the current time.']);
            }
        } else {
            $isASAP = true;
            $pickupTime = null;
        }

        $this->conn->beginTransaction();
        try {
            $orderId = $this->orderModel->create([
                'user_id' => $userId,
                'total' => $total,
                'status' => 'pending',
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentMethod === 'wallet' ? 'paid' : 'unpaid',
                'source' => 'web',
                'pickup_time' => $pickupTime,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'customer_phone' => $customerPhone
            ]);

            if (!$orderId) throw new Exception('Failed to create order');

            // Pass the mapped items (with options) to createBatch
            $this->orderItemModel->createBatch($orderId, $items);

            if ($paymentMethod === 'wallet') {
                if (!$userId) throw new Exception('User ID required for wallet payment');
                $balance = $this->userModel->getBalance($userId);
                if ($balance < $total) {
                    throw new Exception('Insufficient funds');
                }
                $newBalance = $balance - $total;
                $this->userModel->updateBalance($userId, $newBalance);

                $this->transactionModel->create([
                    'user_id' => $userId,
                    'order_id' => $orderId,
                    'amount' => $total,
                    'type' => 'payment',
                    'description' => "Order payment #$orderId"
                ]);
            }

            // Only create notification if user is logged in
            if ($userId) {
                $this->notificationModel->create([
                    'user_id' => $userId,
                    'type' => 'order',
                    'title' => 'Order Received',
                    'message' => "Your order #$orderId has been received and is being prepared.",
                    'action_url' => '/orders'
                ]);
            }

            $this->conn->commit();
            Response::send(200, ['orderId' => $orderId]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            Response::send(500, ['error' => 'Order failed: ' . $e->getMessage()]);
        }
    }

    public function put($id = null) {
        Response::send(405, ['error' => 'Method not allowed']);
    }

    public function delete($id = null) {
        Response::send(405, ['error' => 'Method not allowed']);
    }
}
?>