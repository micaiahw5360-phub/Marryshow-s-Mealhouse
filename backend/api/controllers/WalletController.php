<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Transaction.php'; // we'll create this model

class WalletController {
    private $userModel;
    private $transactionModel;
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->userModel = new User($this->conn);
        $this->transactionModel = new Transaction($this->conn);
    }

    private function getUserId() {
        $headers = getallheaders();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
        return Security::verifyToken($token);
    }

    // GET /wallet - get current balance
    public function get() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        
        $balance = $this->userModel->getBalance($userId);
        Response::send(200, ['balance' => $balance]);
    }

    // GET /wallet/transactions - get transaction history
    public function getTransactions() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        
        $transactions = $this->transactionModel->findByUserId($userId);
        Response::send(200, $transactions);
    }

    // POST /wallet/topup - add funds
    public function topUp() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        
        $input = Security::getJsonInput();
        if (!$input || !isset($input['amount'])) {
            Response::send(400, ['error' => 'Amount required']);
        }
        
        $amount = (float)$input['amount'];
        if ($amount <= 0) {
            Response::send(400, ['error' => 'Amount must be positive']);
        }
        if ($amount < 5) {
            Response::send(400, ['error' => 'Minimum top-up is $5']);
        }
        if ($amount > 500) {
            Response::send(400, ['error' => 'Maximum top-up is $500']);
        }
        
        // Update user balance
        $currentBalance = $this->userModel->getBalance($userId);
        $newBalance = $currentBalance + $amount;
        $updated = $this->userModel->updateBalance($userId, $newBalance);
        
        if (!$updated) {
            Response::send(500, ['error' => 'Failed to update balance']);
        }
        
        // Create transaction record
        $transactionId = $this->transactionModel->create([
            'user_id' => $userId,
            'order_id' => null,
            'amount' => $amount,
            'type' => 'topup',
            'description' => 'Wallet top-up of $' . number_format($amount, 2)
        ]);
        
        if (!$transactionId) {
            // Log error but still return success because balance was updated
            error_log("Failed to record transaction for user $userId top-up");
        }
        
        Response::send(200, ['newBalance' => $newBalance, 'message' => 'Wallet topped up successfully']);
    }
}
?>