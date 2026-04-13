<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/db.php';

$email = isset($_GET['email']) ? trim($_GET['email']) : '';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email is required']);
    exit;
}

$database = new Database();
$conn = $database->getConnection();

// Use 'username' instead of 'name' (or keep 'name' if your table has it)
$query = "SELECT id, email, username as name, wallet_balance, is_active FROM users WHERE email = ?";
$stmt = $conn->prepare($query);
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

if (!$user['is_active']) {
    http_response_code(403);
    echo json_encode(['error' => 'Account is deactivated']);
    exit;
}

echo json_encode([
    'id' => $user['id'],
    'email' => $user['email'],
    'username' => $user['username'] ?? '',
    'name' => $user['name'] ?? ($user['username'] ?? ''),
    'wallet_balance' => (float)$user['wallet_balance']
]);
?>