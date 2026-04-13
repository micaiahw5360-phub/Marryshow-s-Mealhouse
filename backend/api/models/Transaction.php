<?php
class Transaction {
    private $conn;
    private $table = 'transactions';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function findByUserId($userId) {
        $query = "SELECT id, amount, type, description, created_at as date 
                  FROM {$this->table} 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} (user_id, order_id, amount, type, description) 
                  VALUES (:user_id, :order_id, :amount, :type, :description)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $data['user_id']);
        $stmt->bindParam(':order_id', $data['order_id']);
        $stmt->bindParam(':amount', $data['amount']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':description', $data['description']);
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }
}
?>