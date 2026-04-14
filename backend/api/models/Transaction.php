<?php
class Transaction {
    private $conn;
    private $table = 'transactions';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function findByUserId($userId) {
        $query = "SELECT id, amount, type, category, description, created_at as date 
                  FROM {$this->table} 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $category = isset($data['category']) ? $data['category'] : 'other';
        $query = "INSERT INTO {$this->table} (user_id, order_id, amount, type, category, description) 
                  VALUES (:user_id, :order_id, :amount, :type, :category, :description)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $data['user_id']);
        $stmt->bindParam(':order_id', $data['order_id']);
        $stmt->bindParam(':amount', $data['amount']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':description', $data['description']);
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function getSpendingByCategory($userId) {
        $query = "SELECT category, SUM(amount) as total 
                  FROM {$this->table} 
                  WHERE user_id = :user_id AND type = 'debit'
                  GROUP BY category";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSummary($userId) {
        $query = "SELECT 
                    SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits,
                    SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debits
                  FROM {$this->table} 
                  WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>