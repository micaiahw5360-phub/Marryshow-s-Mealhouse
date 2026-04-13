<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/kiosk.php';

header('Content-Type: application/json');

$email = $_GET['email'] ?? '';
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email']);
    exit;
}

$database = new Database();
$conn = $database->getConnection();

$stmt = $conn->prepare("SELECT balance FROM users WHERE email = ? AND is_active = 1");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode(['success' => true, 'balance' => (float)$user['balance']]);
} else {
    echo json_encode(['success' => false, 'error' => 'User not found']);
}