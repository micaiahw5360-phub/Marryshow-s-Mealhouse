<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/User.php';

class RegisterController {
    private $userModel;

    public function __construct() {
        $database = new Database();
        $conn = $database->getConnection();
        $this->userModel = new User($conn);
    }

    public function post() {
        $input = Security::getJsonInput();
        if (!$input || !isset($input['username']) || !isset($input['email']) || !isset($input['password'])) {
            Response::send(400, ['error' => 'Username, email and password required']);
        }

        $username = Security::sanitizeInput($input['username']);
        $email = Security::sanitizeInput($input['email']);
        $password = $input['password'];

        // Check existence
        if ($this->userModel->findByUsername($username) || $this->userModel->findByEmail($email)) {
            Response::send(409, ['error' => 'Username or email already exists']);
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $userId = $this->userModel->create([
            'username' => $username,
            'email' => $email,
            'password' => $hashed,
            'role' => 'customer',
            'balance' => 0
        ]);

        if ($userId) {
            $token = Security::generateToken($userId);
            $user = $this->userModel->findById($userId);
            unset($user['password']);
            Response::send(201, ['user' => $user, 'token' => $token]);
        } else {
            Response::send(500, ['error' => 'Registration failed']);
        }
    }
}
?>