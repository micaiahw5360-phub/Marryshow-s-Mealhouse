<?php
class MoneyRequest {
    private $conn;
    private $table = 'money_requests';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($requesterId, $recipientId, $amount, $note) {
        $query = "INSERT INTO {$this->table} (requester_id, recipient_id, amount, note) VALUES (:requester, :recipient, :amount, :note)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':requester', $requesterId);
        $stmt->bindParam(':recipient', $recipientId);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':note', $note);
        return $stmt->execute();
    }

    public function getPendingForUser($userId) {
        $query = "SELECT mr.*, u.username as requester_name, u.email as requester_email
                  FROM {$this->table} mr
                  JOIN users u ON mr.requester_id = u.id
                  WHERE mr.recipient_id = :user_id AND mr.status = 'pending'
                  ORDER BY mr.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSentRequests($userId) {
        $query = "SELECT mr.*, u.username as recipient_name, u.email as recipient_email
                  FROM {$this->table} mr
                  JOIN users u ON mr.recipient_id = u.id
                  WHERE mr.requester_id = :user_id
                  ORDER BY mr.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateStatus($id, $status) {
        $query = "UPDATE {$this->table} SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
?>