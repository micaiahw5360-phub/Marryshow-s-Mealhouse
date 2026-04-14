<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/User.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    $userModel = new User($conn);

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['cardNumber']) || !isset($input['pin'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Card number and PIN required']);
        exit;
    }

    $cardNumber = trim($input['cardNumber']);
    $pin = trim($input['pin']);

    // Find user by card_number
    $user = $userModel->findByCardNumber($cardNumber);
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'Card not found']);
        exit;
    }

    // Verify PIN
    if (empty($user['pin_hash']) || !password_verify($pin, $user['pin_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid PIN']);
        exit;
    }

    // Return safe user data
    echo json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['username'],
        'walletBalance' => (float)($user['balance'] ?? 0),
        'cardNumber' => $user['card_number'],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}