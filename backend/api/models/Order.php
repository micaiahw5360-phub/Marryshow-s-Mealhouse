<?php
class Order {
    private $conn;
    private $table = 'orders';

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create a new order (used by OrdersController)
    public function create($data) {
    $query = "INSERT INTO {$this->table} 
              (user_id, total, status, payment_method, payment_status, source, pickup_time, customer_name, customer_email, customer_phone, order_date) 
              VALUES (:user_id, :total, :status, :payment_method, :payment_status, :source, :pickup_time, :customer_name, :customer_email, :customer_phone, NOW())";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->bindParam(':total', $data['total']);
    $stmt->bindParam(':status', $data['status']);
    $stmt->bindParam(':payment_method', $data['payment_method']);
    $stmt->bindParam(':payment_status', $data['payment_status']);
    $stmt->bindParam(':source', $data['source']);
    $stmt->bindParam(':pickup_time', $data['pickup_time']);
    $stmt->bindParam(':customer_name', $data['customer_name']);
    $stmt->bindParam(':customer_email', $data['customer_email']);
    $stmt->bindParam(':customer_phone', $data['customer_phone']);
    return $stmt->execute() ? $this->conn->lastInsertId() : false;
}

    // Find order by ID
    public function findById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Find all orders for a specific user
    public function findByUserId($userId) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY order_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Find all orders (for staff/admin)
    public function findAll() {
        $query = "SELECT * FROM {$this->table} ORDER BY order_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update order status
    public function updateStatus($orderId, $status) {
        $query = "UPDATE {$this->table} SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':status' => $status, ':id' => $orderId]);
        return $stmt->rowCount() > 0;
    }

    // Count total orders
    public function countAll() {
        $query = "SELECT COUNT(*) as total FROM {$this->table}";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$result['total'];
    }

    // Count orders by status
    public function countByStatus($status) {
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE status = :status";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':status' => $status]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$result['total'];
    }

    // Get recent orders with limit
    public function getRecentOrders($limit = 10) {
        $query = "SELECT o.*, u.username as customer 
                  FROM {$this->table} o 
                  LEFT JOIN users u ON o.user_id = u.id 
                  ORDER BY o.order_date DESC 
                  LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($orders as &$order) {
            $order['id'] = (int)$order['id'];
            $order['total'] = (float)$order['total'];
            $order['user_id'] = (int)$order['user_id'];
            $order['order_date'] = $order['order_date'] ?? date('Y-m-d H:i:s');
            if (empty($order['customer'])) {
                $order['customer'] = 'Guest';
            }
        }
        return $orders;
    }

    // Get weekly sales for dashboard
    public function getWeeklySales() {
        $query = "SELECT DATE(order_date) as day, SUM(total) as sales 
                  FROM {$this->table} 
                  WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                  GROUP BY DATE(order_date)
                  ORDER BY day ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($result as &$row) {
            $row['sales'] = (float)$row['sales'];
        }
        return $result;
    }
}
?>