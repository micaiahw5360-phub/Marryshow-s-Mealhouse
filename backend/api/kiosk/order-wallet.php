<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Order.php';
require_once __DIR__ . '/../../models/OrderItem.php';
require_once __DIR__ . '/../../models/Transaction.php';
require_once __DIR__ . '/../../models/Notification.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    $userModel = new User($conn);
    $orderModel = new Order($conn);
    $orderItemModel = new OrderItem($conn);
    $transactionModel = new Transaction($conn);
    $notificationModel = new Notification($conn);

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['cardNumber']) || !isset($input['items']) || !isset($input['total'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    $cardNumber = trim($input['cardNumber']);
    $items = $input['items'];
    $total = (float)$input['total'];
    $customerEmail = $input['customerEmail'] ?? null;

    // Find user by card number
    $user = $userModel->findByCardNumber($cardNumber);
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'Card not found']);
        exit;
    }

    $userId = $user['id'];
    $currentBalance = (float)($user['balance'] ?? 0);

    if ($currentBalance < $total) {
        http_response_code(400);
        echo json_encode(['error' => 'Insufficient balance']);
        exit;
    }

    $conn->beginTransaction();

    // Deduct balance
    $newBalance = $currentBalance - $total;
    $updated = $userModel->updateBalance($userId, $newBalance);
    if (!$updated) throw new Exception('Failed to update balance');

    // Create order
    $orderId = $orderModel->create([
        'user_id' => $userId,
        'total' => $total,
        'status' => 'pending',
        'payment_method' => 'wallet',
        'payment_status' => 'paid',
        'source' => 'kiosk',
        'pickup_time' => null,
        'customer_name' => $user['username'],
        'customer_email' => $customerEmail ?? $user['email'],
        'customer_phone' => $user['phone'] ?? ''
    ]);

    if (!$orderId) throw new Exception('Failed to create order');

    // Create order items (with options)
    $orderItems = [];
    foreach ($items as $item) {
        $orderItems[] = [
            'menu_item_id' => $item['id'],
            'quantity' => $item['quantity'],
            'price' => $item['price'],
            'options' => $item['options'] ?? null
        ];
    }
    $orderItemModel->createBatch($orderId, $orderItems);

    // Record transaction
    $transactionModel->create([
        'user_id' => $userId,
        'order_id' => $orderId,
        'amount' => $total,
        'type' => 'debit',
        'category' => 'dining',
        'description' => "Kiosk order #$orderId"
    ]);

    // Notify user (if they have notifications enabled)
    $notificationModel->create([
        'user_id' => $userId,
        'type' => 'order',
        'title' => 'Kiosk Order Confirmed',
        'message' => "Your order #$orderId ($$total) was paid with your Marryshow Card.",
        'action_url' => '/orders'
    ]);

    $conn->commit();

    echo json_encode([
        'success' => true,
        'orderId' => $orderId,
        'newBalance' => $newBalance
    ]);
} catch (Exception $e) {
    if (isset($conn)) $conn->rollBack();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}