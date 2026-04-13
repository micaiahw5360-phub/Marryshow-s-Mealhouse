<?php
// Include the Security class (custom JWT implementation)
require_once __DIR__ . '/../utils/Security.php';
// Include Database and User model (optional, but recommended to get fresh user data)
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/User.php';

function authenticate() {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    }
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        exit;
    }
    
    // Verify token using your existing Security class
    $userId = Security::verifyToken($token);
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }
    
    // (Optional but recommended) Fetch fresh user data from database
    try {
        $database = new Database();
        $conn = $database->getConnection();
        $userModel = new User($conn);
        $user = $userModel->findById($userId);
        
        if (!$user || (isset($user['is_active']) && !$user['is_active'])) {
            http_response_code(403);
            echo json_encode(['error' => 'User not found or inactive']);
            exit;
        }
        
        // Return user data (without password)
        unset($user['password']);
        return $user;
    } catch (Exception $e) {
        // Fallback: return at least the user ID if DB fails
        return ['id' => $userId];
    }
}
?>