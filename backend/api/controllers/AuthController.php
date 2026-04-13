<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/User.php';

// Load Composer autoloader for Google Client
$composerAutoload = __DIR__ . '/../vendor/autoload.php';
if (file_exists($composerAutoload)) {
    require_once $composerAutoload;
} else {
    $composerAutoload = __DIR__ . '/../../vendor/autoload.php';
    if (file_exists($composerAutoload)) {
        require_once $composerAutoload;
    }
}

class AuthController {
    private $userModel;

    public function __construct() {
        $database = new Database();
        $conn = $database->getConnection();
        $this->userModel = new User($conn);
    }

    public function post() {
        $input = Security::getJsonInput();
        if (!$input || !isset($input['email']) || !isset($input['password'])) {
            Response::send(400, ['error' => 'Email and password required']);
        }

        $user = $this->userModel->findByEmail($input['email']);
        if (!$user) {
            Response::send(401, ['error' => 'Invalid email or password']);
        }

        if (!password_verify($input['password'], $user['password'])) {
            Response::send(401, ['error' => 'Invalid email or password']);
        }

        if (isset($user['is_active']) && !$user['is_active']) {
            Response::send(403, ['error' => 'Account is deactivated']);
        }

        $token = Security::generateToken($user['id']);
        unset($user['password']);
        Response::send(200, ['user' => $user, 'token' => $token]);
    }

    public function forgotPassword() {
        Response::send(501, ['error' => 'Not implemented']);
    }

    public function resetPassword() {
        Response::send(501, ['error' => 'Not implemented']);
    }

    public function googleAuth() {
        // Check if Google Client is available
        if (!class_exists('Google\Client')) {
            Response::send(500, [
                'error' => 'Google Client library not installed.',
                'fix' => 'Run: cd backend && composer require google/apiclient'
            ]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $id_token = $input['token'] ?? null;

        if (!$id_token) {
            Response::send(400, ['error' => 'ID token is required']);
            return;
        }

        // Use environment variable for client ID (fallback to hardcoded for local)
        $clientId = getenv('GOOGLE_CLIENT_ID') ?: '1048393763438-na9g6fkbulept3j1kqo34gb54im30fve.apps.googleusercontent.com';

        try {
            $client = new Google\Client(['client_id' => $clientId]);
            $payload = $client->verifyIdToken($id_token);

            if (!$payload) {
                Response::send(401, ['error' => 'Invalid ID token']);
                return;
            }

            $email = $payload['email'];
            $name = $payload['name'];

            // Find existing user by email
            $user = $this->userModel->findByEmail($email);
            if (!$user) {
                // Generate unique username from email prefix
                $baseUsername = explode('@', $email)[0];
                $username = $baseUsername;
                $counter = 1;
                while ($this->userModel->findByUsername($username)) {
                    $username = $baseUsername . $counter;
                    $counter++;
                }

                // Create new user – adjust column names to match your table
                $userId = $this->userModel->create([
                    'username' => $username,
                    'email' => $email,
                    'password' => password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT),
                    'role' => 'customer',
                    'balance' => 0,
                    'is_active' => 1
                ]);
                if (!$userId) {
                    throw new Exception('Failed to create user');
                }
                $user = $this->userModel->findById($userId);
            }

            $token = Security::generateToken($user['id']);
            unset($user['password']);
            Response::send(200, [
                'user' => $user,
                'token' => $token,
                'remember' => false
            ]);
        } catch (Exception $e) {
            Response::send(500, ['error' => 'Google authentication failed: ' . $e->getMessage()]);
        }
    }
}
?>