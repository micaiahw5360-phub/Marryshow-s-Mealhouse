<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/OrderItem.php';
require_once __DIR__ . '/../models/Transaction.php';
require_once __DIR__ . '/../models/Notification.php';

class KioskController {
    private $conn;
    private $userModel;
    private $orderModel;
    private $orderItemModel;
    private $transactionModel;
    private $notificationModel;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->userModel = new User($this->conn);
        $this->orderModel = new Order($this->conn);
        $this->orderItemModel = new OrderItem($this->conn);
        $this->transactionModel = new Transaction($this->conn);
        $this->notificationModel = new Notification($this->conn);
    }

    // POST /kiosk/auth
    public function authenticateWithCard() {
        $input = Security::getJsonInput();
        if (!$input || !isset($input['cardNumber']) || !isset($input['pin'])) {
            Response::send(400, ['error' => 'Card number and PIN required']);
        }

        $cardNumber = trim($input['cardNumber']);
        $pin = trim($input['pin']);

        $user = $this->userModel->findByCardNumber($cardNumber);
        if (!$user) {
            Response::send(404, ['error' => 'Card not found']);
        }

        if (empty($user['pin_hash']) || !password_verify($pin, $user['pin_hash'])) {
            Response::send(401, ['error' => 'Invalid PIN']);
        }

        Response::send(200, [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['username'],
            'walletBalance' => (float)($user['balance'] ?? 0),
            'cardNumber' => $user['card_number'],
        ]);
    }

    // POST /kiosk/order
    public function placeWalletOrder() {
        $input = Security::getJsonInput();
        if (!$input || !isset($input['cardNumber']) || !isset($input['items']) || !isset($input['total'])) {
            Response::send(400, ['error' => 'Missing required fields']);
        }

        $cardNumber = trim($input['cardNumber']);
        $items = $input['items'];
        $total = (float)$input['total'];
        $customerEmail = $input['customerEmail'] ?? null;

        $user = $this->userModel->findByCardNumber($cardNumber);
        if (!$user) {
            Response::send(404, ['error' => 'Card not found']);
        }

        $userId = $user['id'];
        $currentBalance = (float)($user['balance'] ?? 0);
        if ($currentBalance < $total) {
            Response::send(400, ['error' => 'Insufficient balance']);
        }

        $this->conn->beginTransaction();
        try {
            $newBalance = $currentBalance - $total;
            $updated = $this->userModel->updateBalance($userId, $newBalance);
            if (!$updated) throw new Exception('Failed to update balance');

            $orderId = $this->orderModel->create([
                'user_id' => $userId,
                'total' => $total,
                'status' => 'pending',
                'payment_method' => 'wallet',
                'payment_status' => 'paid',
                'source' => 'kiosk',
                'pickup_time' => null,
                'customer_name' => $user['username'],
                'customer_email' => $customerEmail ?? $user['email'],
                'customer_phone' => $user['phone'] ?? ''
            ]);
            if (!$orderId) throw new Exception('Failed to create order');

            $orderItems = [];
            foreach ($items as $item) {
                $orderItems[] = [
                    'menu_item_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'options' => $item['options'] ?? null
                ];
            }
            $this->orderItemModel->createBatch($orderId, $orderItems);

            $this->transactionModel->create([
                'user_id' => $userId,
                'order_id' => $orderId,
                'amount' => $total,
                'type' => 'debit',
                'category' => 'dining',
                'description' => "Kiosk order #$orderId"
            ]);

            $this->notificationModel->create([
                'user_id' => $userId,
                'type' => 'order',
                'title' => 'Kiosk Order Confirmed',
                'message' => "Your order #$orderId ($$total) was paid with your Marryshow Card.",
                'action_url' => '/orders'
            ]);

            $this->conn->commit();
            Response::send(200, [
                'success' => true,
                'orderId' => $orderId,
                'newBalance' => $newBalance
            ]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            Response::send(500, ['error' => $e->getMessage()]);
        }
    }

    // GET /kiosk/balance?cardNumber=...
    public function getBalanceByCard() {
        $cardNumber = $_GET['cardNumber'] ?? '';
        if (empty($cardNumber)) {
            Response::send(400, ['error' => 'Card number required']);
        }
        $user = $this->userModel->findByCardNumber($cardNumber);
        if (!$user) {
            Response::send(404, ['error' => 'Card not found']);
        }
        Response::send(200, ['balance' => (float)($user['balance'] ?? 0)]);
    }
}
?>