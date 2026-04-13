<?php
class OrderItem {
    private $conn;
    private $table = 'order_items';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function findByOrderId($orderId) {
        $query = "SELECT oi.*, mi.name 
                  FROM {$this->table} oi
                  JOIN menu_items mi ON oi.menu_item_id = mi.id
                  WHERE oi.order_id = :order_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':order_id', $orderId);
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($items as &$item) {
            $item['id'] = (int)$item['id'];
            $item['order_id'] = (int)$item['order_id'];
            $item['menu_item_id'] = (int)$item['menu_item_id'];
            $item['quantity'] = (int)$item['quantity'];
            $item['price'] = (float)$item['price'];
            // Decode options JSON if present
            if (!empty($item['options'])) {
                $item['options'] = json_decode($item['options'], true);
            }
        }
        return $items;
    }

    /**
     * Create multiple order items in a batch
     * @param int $orderId
     * @param array $items Each item should have: id, quantity, price, options (optional)
     * @return bool
     */
    public function createBatch($orderId, $items) {
        $query = "INSERT INTO {$this->table} (order_id, menu_item_id, quantity, price, options) VALUES ";
        $values = [];
        $params = [];
        foreach ($items as $index => $item) {
            $values[] = "(:order_id{$index}, :menu_item_id{$index}, :quantity{$index}, :price{$index}, :options{$index})";
            $params[":order_id{$index}"] = $orderId;
            $params[":menu_item_id{$index}"] = $item['id'];
            $params[":quantity{$index}"] = $item['quantity'];
            $params[":price{$index}"] = $item['price'];
            // Encode options as JSON (if provided)
            $optionsJson = isset($item['options']) ? json_encode($item['options']) : null;
            $params[":options{$index}"] = $optionsJson;
        }
        $query .= implode(', ', $values);
        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => &$val) {
            $stmt->bindParam($key, $val);
        }
        return $stmt->execute();
    }

    public function getPopularItems() {
        $query = "SELECT mi.name, SUM(oi.quantity) as orders 
                  FROM {$this->table} oi
                  JOIN menu_items mi ON oi.menu_item_id = mi.id
                  GROUP BY oi.menu_item_id
                  ORDER BY orders DESC
                  LIMIT 5";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>