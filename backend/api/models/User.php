<?php
class User {
    private $conn;
    private $table = 'users';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function findById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            if (isset($user['balance'])) {
                $user['walletBalance'] = (float)$user['balance'];
            } elseif (isset($user['wallet_balance'])) {
                $user['walletBalance'] = (float)$user['wallet_balance'];
            }
        }
        return $user;
    }

    public function findByEmail($email) {
        $query = "SELECT * FROM {$this->table} WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            if (isset($user['balance'])) {
                $user['walletBalance'] = (float)$user['balance'];
            } elseif (isset($user['wallet_balance'])) {
                $user['walletBalance'] = (float)$user['wallet_balance'];
            }
        }
        return $user;
    }

    public function findByUsername($username) {
        $query = "SELECT * FROM {$this->table} WHERE username = :username";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Helper method to generate card number
    private function generateCardNumber($userId) {
        return 'MC' . str_pad($userId, 8, '0', STR_PAD_LEFT);
    }

    // Updated create method with auto-generated card number
    public function create($data) {
        $balanceValue = $data['balance'] ?? 0;
        $isActive = $data['is_active'] ?? 1;
        
        $query = "INSERT INTO {$this->table} (username, email, password, role, balance, is_active) 
                  VALUES (:username, :email, :password, :role, :balance, :is_active)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $data['username']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password', $data['password']);
        $stmt->bindParam(':role', $data['role']);
        $stmt->bindParam(':balance', $balanceValue);
        $stmt->bindParam(':is_active', $isActive);
        
        if ($stmt->execute()) {
            $userId = $this->conn->lastInsertId();
            $cardNumber = $this->generateCardNumber($userId);
            $updateStmt = $this->conn->prepare("UPDATE {$this->table} SET card_number = :card WHERE id = :id");
            $updateStmt->bindParam(':card', $cardNumber);
            $updateStmt->bindParam(':id', $userId);
            $updateStmt->execute();
            return $userId;
        }
        return false;
    }

    public function update($id, $data) {
        $allowed = ['username', 'email', 'phone', 'address', 'student_id', 'role', 'balance', 'is_active', 'avatar'];
        $updates = [];
        $params = [':id' => $id];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        if (empty($updates)) return false;
        $query = "UPDATE {$this->table} SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => &$val) {
            $stmt->bindParam($key, $val);
        }
        return $stmt->execute();
    }

    public function updatePassword($id, $hashedPassword) {
        $query = "UPDATE {$this->table} SET password = :pass WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':pass', $hashedPassword);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function updateBalance($id, $newBalance) {
        $balanceColumn = 'balance';
        $query = "UPDATE {$this->table} SET $balanceColumn = :balance WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':balance', $newBalance);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function getBalance($id) {
        $balanceColumn = 'balance';
        $query = "SELECT $balanceColumn FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return (float)$stmt->fetchColumn();
    }

    public function countAll() {
        $query = "SELECT COUNT(*) FROM {$this->table}";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }

    public function updateAvatar($id, $avatarUrl) {
        $query = "UPDATE {$this->table} SET avatar = :avatar WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':avatar', $avatarUrl);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function updateNotificationPrefs($id, $prefs) {
        $prefsJson = json_encode($prefs);
        $query = "UPDATE {$this->table} SET notification_prefs = :prefs WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':prefs', $prefsJson);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function getNotificationPrefs($id) {
        $query = "SELECT notification_prefs FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $prefs = $stmt->fetchColumn();
        return $prefs ? json_decode($prefs, true) : ['orderUpdates' => true, 'promotions' => false, 'newsletter' => true];
    }

    public function getAll() {
        $balanceColumn = 'balance';
        $query = "SELECT id, username, email, role, $balanceColumn as walletBalance, is_active as active, created_at 
                  FROM {$this->table}";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($users as &$user) {
            $user['id'] = (int)$user['id'];
            $user['walletBalance'] = (float)$user['walletBalance'];
            $user['active'] = (bool)$user['active'];
        }
        return $users;
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
?>