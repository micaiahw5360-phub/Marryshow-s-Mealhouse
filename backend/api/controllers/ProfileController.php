<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/User.php';

class ProfileController {
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

    public function get() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $user = $this->userModel->findById($userId);
        if (!$user) Response::send(404, ['error' => 'User not found']);
        unset($user['password']);
        Response::send(200, $user);
    }

    public function put() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $input = Security::getJsonInput();
        if (!$input) Response::send(400, ['error' => 'No data provided']);

        $allowed = ['username', 'email', 'phone', 'address', 'student_id'];
        $updateData = array_intersect_key($input, array_flip($allowed));
        if (empty($updateData)) {
            Response::send(400, ['error' => 'No valid fields to update']);
        }

        // Check if username or email already taken by another user
        if (isset($updateData['username'])) {
            $existing = $this->userModel->findByUsername($updateData['username']);
            if ($existing && $existing['id'] != $userId) {
                Response::send(400, ['error' => 'Username already taken']);
            }
        }
        if (isset($updateData['email'])) {
            $existing = $this->userModel->findByEmail($updateData['email']);
            if ($existing && $existing['id'] != $userId) {
                Response::send(400, ['error' => 'Email already taken']);
            }
        }

        $result = $this->userModel->update($userId, $updateData);
        if (!$result) {
            Response::send(500, ['error' => 'Failed to update profile']);
        }

        $updatedUser = $this->userModel->findById($userId);
        unset($updatedUser['password']);
        Response::send(200, ['message' => 'Profile updated', 'user' => $updatedUser]);
    }

    public function changePassword() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $input = Security::getJsonInput();
        if (!$input || !isset($input['old_password']) || !isset($input['new_password'])) {
            Response::send(400, ['error' => 'Old and new password required']);
        }
        $user = $this->userModel->findById($userId);
        if (!$user || !password_verify($input['old_password'], $user['password'])) {
            Response::send(400, ['error' => 'Incorrect current password']);
        }
        $hashed = password_hash($input['new_password'], PASSWORD_DEFAULT);
        $this->userModel->updatePassword($userId, $hashed);
        Response::send(200, ['message' => 'Password changed']);
    }

    public function uploadAvatar() {
    $userId = $this->getUserId();
    if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
    
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        Response::send(400, ['error' => 'No valid file uploaded']);
    }
    
    $file = $_FILES['avatar'];
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowed)) {
        Response::send(400, ['error' => 'Only JPG, PNG, GIF, WEBP allowed']);
    }
    if ($file['size'] > 2 * 1024 * 1024) {
        Response::send(400, ['error' => 'File too large (max 2MB)']);
    }
    
    $uploadDir = __DIR__ . '/../../uploads/avatars/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            Response::send(500, ['error' => 'Failed to create upload directory']);
        }
    }
    
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'user_' . $userId . '_' . time() . '.' . $ext;
    $targetPath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Build full absolute URL
        $protocol = isset($_SERVER['HTTPS']) ? 'https://' : 'http://';
        $baseUrl = $protocol . $_SERVER['HTTP_HOST'] . '/MarryShow-Mealhouse/backend';
        $avatarUrl = $baseUrl . '/uploads/avatars/' . $filename;
        
        $result = $this->userModel->updateAvatar($userId, $avatarUrl);
        if (!$result) {
            Response::send(500, ['error' => 'Failed to update avatar in database']);
        }
        Response::send(200, ['avatarUrl' => $avatarUrl]);
    } else {
        Response::send(500, ['error' => 'Failed to move uploaded file']);
    }
}

    public function getNotificationPrefs() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $prefs = $this->userModel->getNotificationPrefs($userId);
        Response::send(200, $prefs);
    }

    public function updateNotificationPrefs() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $input = Security::getJsonInput();
        if (!$input) Response::send(400, ['error' => 'No data provided']);
        $this->userModel->updateNotificationPrefs($userId, $input);
        Response::send(200, ['message' => 'Preferences updated']);
    }
}
?>