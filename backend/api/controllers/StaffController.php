<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/OrderItem.php';
require_once __DIR__ . '/../models/Notification.php';

class StaffController {
    private $orderModel;
    private $orderItemModel;
    private $notificationModel;
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->orderModel = new Order($this->conn);
        $this->orderItemModel = new OrderItem($this->conn);
        $this->notificationModel = new Notification($this->conn);
    }

    private function getUserId() {
        $headers = getallheaders();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
        return Security::verifyToken($token);
    }

    private function getUserRole() {
        $userId = $this->getUserId();
        if (!$userId) return null;
        $query = "SELECT role FROM users WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ? $user['role'] : null;
    }

    private function authorizeStaff() {
        $role = $this->getUserRole();
        if (!$role || !in_array($role, ['staff', 'admin'])) {
            Response::send(403, ['error' => 'Access denied. Staff only.']);
        }
        return true;
    }

    private function getUserById($id) {
        $query = "SELECT username, email, phone FROM users WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getOrders() {
        $this->authorizeStaff();
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        $orders = $this->orderModel->findAll();
        if ($status) {
            $orders = array_filter($orders, fn($o) => $o['status'] === $status);
            $orders = array_values($orders);
        }
        foreach ($orders as &$order) {
            $order['id'] = (int)$order['id'];
            $order['user_id'] = (int)$order['user_id'];
            $order['total'] = (float)$order['total'];
            $order['order_date'] = $order['order_date'] ?? date('Y-m-d H:i:s');
            $order['source'] = $order['source'] ?? 'web';

            $order['items'] = $this->orderItemModel->findByOrderId($order['id']);
            foreach ($order['items'] as &$item) {
                $item['id'] = (int)$item['id'];
                $item['price'] = (float)$item['price'];
                $item['quantity'] = (int)$item['quantity'];
                $item['menu_item_id'] = (int)$item['menu_item_id'];
            }

            // Use customer fields from order if set, otherwise fallback to user
            if (!empty($order['customer_name'])) {
                // already set – do nothing
            } else {
                $user = $this->getUserById($order['user_id']);
                $order['customer_name'] = $user ? $user['username'] : 'Guest';
                $order['customer_phone'] = $user ? ($user['phone'] ?? '') : '';
            }
        }
        header('Content-Type: application/json');
        echo json_encode(array_values($orders));
        exit;
    }

    public function getMetrics() {
        $this->authorizeStaff();
        $orders = $this->orderModel->findAll();
        $today = date('Y-m-d');
        $pending = 0;
        $processing = 0;
        $prepared = 0;
        $completedToday = 0;
        $totalPrepTime = 0;
        $completedCount = 0;

        foreach ($orders as $order) {
            if ($order['status'] === 'pending') $pending++;
            if ($order['status'] === 'processing') $processing++;
            if ($order['status'] === 'prepared') $prepared++;
            if ($order['status'] === 'completed' && substr($order['order_date'], 0, 10) === $today) {
                $completedToday++;
                $created = strtotime($order['order_date']);
                $completedTime = strtotime($order['updated_at'] ?? $order['order_date']);
                $prepTime = ($completedTime - $created) / 60;
                if ($prepTime > 0) {
                    $totalPrepTime += $prepTime;
                    $completedCount++;
                }
            }
        }
        $avgPrepTime = $completedCount > 0 ? round($totalPrepTime / $completedCount, 1) : 0;

        $metrics = [
            'pending' => $pending,
            'processing' => $processing,
            'prepared' => $prepared,
            'completed_today' => $completedToday,
            'avg_prep_time' => $avgPrepTime,
            'total_orders_today' => $completedToday + $pending + $processing + $prepared
        ];

        header('Content-Type: application/json');
        echo json_encode($metrics);
        exit;
    }

    public function updateOrderStatus($orderId) {
    $this->authorizeStaff();

    try {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);

        if (!$input || !isset($input['status'])) {
            Response::send(400, ['error' => 'Status required']);
            return;
        }

        $newStatus = $input['status'];
        $allowed = ['pending', 'processing', 'prepared', 'completed', 'cancelled'];
        if (!in_array($newStatus, $allowed)) {
            Response::send(400, ['error' => 'Invalid status', 'allowed' => $allowed]);
            return;
        }

        $order = $this->orderModel->findById($orderId);
        if (!$order) {
            Response::send(404, ['error' => 'Order not found']);
            return;
        }

        $oldStatus = $order['status'] ?? 'pending';

        // Update status
        $query = "UPDATE orders SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $newStatus);
        $stmt->bindParam(':id', $orderId);
        $updated = $stmt->execute();

        if (!$updated) {
            Response::send(500, ['error' => 'Database update failed']);
            return;
        }

        // Optional: log status change (skip if table missing)
        $staffId = $this->getUserId();
        if ($staffId) {
            try {
                $stmt = $this->conn->prepare("INSERT INTO order_status_logs (order_id, staff_id, old_status, new_status) VALUES (?, ?, ?, ?)");
                $stmt->execute([$orderId, $staffId, $oldStatus, $newStatus]);
            } catch (PDOException $e) {
                // ignore – table might not exist
            }
        }

        // Notify customer for prepared, completed, or cancelled
        if (in_array($newStatus, ['prepared', 'completed', 'cancelled']) && $order['user_id']) {
            $title = '';
            $message = '';
            if ($newStatus === 'prepared') {
                $title = 'Order Ready for Pickup';
                $message = "Your order #$orderId is ready for pickup! Please come to the counter.";
            } elseif ($newStatus === 'completed') {
                $title = 'Order Completed';
                $message = "Your order #$orderId has been completed. Thank you for dining with us!";
            } elseif ($newStatus === 'cancelled') {
                $title = 'Order Cancelled';
                $message = "Your order #$orderId has been cancelled.";
            }
            $this->notificationModel->create([
                'user_id' => $order['user_id'],
                'type' => 'order',
                'title' => $title,
                'message' => $message,
                'action_url' => '/orders'
            ]);
        }

        Response::send(200, ['message' => 'Order status updated', 'status' => $newStatus]);
    } catch (Exception $e) {
        error_log("StaffController updateOrderStatus error: " . $e->getMessage());
        Response::send(500, ['error' => 'Server error: ' . $e->getMessage()]);
    }
}

    // Server‑Sent Events stream (optional)
    public function streamOrders() {
        $this->authorizeStaff();
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *');

        $lastOrderCount = 0;
        while (true) {
            $orders = $this->orderModel->findAll();
            $currentCount = count($orders);
            if ($currentCount != $lastOrderCount) {
                $enriched = [];
                foreach ($orders as $order) {
                    $order['id'] = (int)$order['id'];
                    $order['user_id'] = (int)$order['user_id'];
                    $order['total'] = (float)$order['total'];
                    $order['order_date'] = $order['order_date'] ?? date('Y-m-d H:i:s');
                    $order['source'] = $order['source'] ?? 'web';

                    $order['items'] = $this->orderItemModel->findByOrderId($order['id']);
                    foreach ($order['items'] as &$item) {
                        $item['id'] = (int)$item['id'];
                        $item['price'] = (float)$item['price'];
                        $item['quantity'] = (int)$item['quantity'];
                        $item['menu_item_id'] = (int)$item['menu_item_id'];
                    }

                    if (!empty($order['customer_name'])) {
                        // already set
                    } else {
                        $user = $this->getUserById($order['user_id']);
                        $order['customer_name'] = $user ? $user['username'] : 'Guest';
                        $order['customer_phone'] = $user ? ($user['phone'] ?? '') : '';
                    }
                    $enriched[] = $order;
                }
                echo "data: " . json_encode($enriched) . "\n\n";
                ob_flush();
                flush();
                $lastOrderCount = $currentCount;
            }
            sleep(2);
        }
    }
}
?>