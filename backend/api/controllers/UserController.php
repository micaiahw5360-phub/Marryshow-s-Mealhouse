<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/User.php';

class UserController {
    private $userModel;

    public function __construct() {
        $database = new Database();
        $conn = $database->getConnection();
        $this->userModel = new User($conn);
    }

    private function getUserId() {
        $headers = getallheaders();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
        return Security::verifyToken($token);
    }

    public function updateProfile() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $input = Security::getJsonInput();
        if (!$input) {
            Response::send(400, ['error' => 'No data provided']);
        }
        $allowed = ['username', 'email', 'phone', 'address', 'student_id'];
        $updateData = array_intersect_key($input, array_flip($allowed));
        if (empty($updateData)) {
            Response::send(400, ['error' => 'No valid fields to update']);
        }
        $fields = [];
        foreach ($updateData as $key => $value) {
            $fields[] = "$key = :$key";
        }
        $query = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->userModel->conn->prepare($query);
        foreach ($updateData as $key => &$val) {
            $stmt->bindParam(":$key", $val);
        }
        $stmt->bindParam(':id', $userId);
        if ($stmt->execute()) {
            Response::send(200, ['message' => 'Profile updated']);
        } else {
            Response::send(500, ['error' => 'Update failed']);
        }
    }

    public function changePassword() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $input = Security::getJsonInput();
        if (!$input || !isset($input['old_password']) || !isset($input['new_password'])) {
            Response::send(400, ['error' => 'Old and new password required']);
        }
        $user = $this->userModel->findById($userId);
        if (!password_verify($input['old_password'], $user['password'])) {
            Response::send(401, ['error' => 'Invalid old password']);
        }
        $newHash = password_hash($input['new_password'], PASSWORD_DEFAULT);
        $query = "UPDATE users SET password = :password WHERE id = :id";
        $stmt = $this->userModel->conn->prepare($query);
        $stmt->bindParam(':password', $newHash);
        $stmt->bindParam(':id', $userId);
        if ($stmt->execute()) {
            Response::send(200, ['message' => 'Password changed']);
        } else {
            Response::send(500, ['error' => 'Failed to change password']);
        }
    }
}
?>