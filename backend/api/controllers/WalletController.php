<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Transaction.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../models/MoneyRequest.php';  // NEW

class WalletController {
    private $userModel;
    private $transactionModel;
    private $notificationModel;
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->userModel = new User($this->conn);
        $this->transactionModel = new Transaction($this->conn);
        $this->notificationModel = new Notification($this->conn);
    }

    private function getUserId() {
        $headers = getallheaders();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
        return Security::verifyToken($token);
    }

    public function get() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $balance = $this->userModel->getBalance($userId);
        Response::send(200, ['balance' => $balance]);
    }

    public function getTransactions() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $transactions = $this->transactionModel->findByUserId($userId);
        Response::send(200, $transactions);
    }

    public function getSummary() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $byCategory = $this->transactionModel->getSpendingByCategory($userId);
        $summary = $this->transactionModel->getSummary($userId);
        Response::send(200, ['byCategory' => $byCategory, 'summary' => $summary]);
    }

    public function topUp() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        
        $input = Security::getJsonInput();
        if (!$input || !isset($input['amount'])) {
            Response::send(400, ['error' => 'Amount required']);
        }
        
        $amount = (float)$input['amount'];
        if ($amount <= 0 || $amount < 5 || $amount > 500) {
            Response::send(400, ['error' => 'Invalid amount. Min $5, Max $500']);
        }
        
        $currentBalance = $this->userModel->getBalance($userId);
        $newBalance = $currentBalance + $amount;
        $this->userModel->updateBalance($userId, $newBalance);
        
        $this->transactionModel->create([
            'user_id' => $userId,
            'order_id' => null,
            'amount' => $amount,
            'type' => 'credit',
            'category' => 'topup',
            'description' => 'Wallet top-up of $' . number_format($amount, 2)
        ]);
        
        $this->notificationModel->create([
            'user_id' => $userId,
            'type' => 'wallet',
            'title' => 'Wallet Top-Up Successful',
            'message' => 'You have successfully added $' . number_format($amount, 2) . ' to your wallet.',
            'action_url' => '/wallet'
        ]);
        
        Response::send(200, ['newBalance' => $newBalance, 'message' => 'Wallet topped up successfully']);
    }

    public function transfer() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        
        $input = Security::getJsonInput();
        if (!$input || !isset($input['recipient_email']) || !isset($input['amount'])) {
            Response::send(400, ['error' => 'Recipient email and amount required']);
        }
        
        $recipientEmail = trim($input['recipient_email']);
        $amount = (float)$input['amount'];
        $note = $input['note'] ?? '';
        
        if ($amount <= 0) Response::send(400, ['error' => 'Amount must be positive']);
        if ($amount < 1) Response::send(400, ['error' => 'Minimum transfer is $1']);
        
        $senderBalance = $this->userModel->getBalance($userId);
        if ($senderBalance < $amount) Response::send(400, ['error' => 'Insufficient balance']);
        
        $recipient = $this->userModel->findByEmail($recipientEmail);
        if (!$recipient) Response::send(404, ['error' => 'Recipient not found']);
        if ($recipient['id'] == $userId) Response::send(400, ['error' => 'Cannot transfer to yourself']);
        
        $newSenderBalance = $senderBalance - $amount;
        $this->userModel->updateBalance($userId, $newSenderBalance);
        
        $recipientBalance = $this->userModel->getBalance($recipient['id']);
        $newRecipientBalance = $recipientBalance + $amount;
        $this->userModel->updateBalance($recipient['id'], $newRecipientBalance);
        
        $this->transactionModel->create([
            'user_id' => $userId,
            'order_id' => null,
            'amount' => $amount,
            'type' => 'debit',
            'category' => 'transfer',
            'description' => 'Sent to ' . $recipient['email'] . ($note ? ' (' . $note . ')' : '')
        ]);
        
        $this->transactionModel->create([
            'user_id' => $recipient['id'],
            'order_id' => null,
            'amount' => $amount,
            'type' => 'credit',
            'category' => 'transfer',
            'description' => 'Received from ' . $this->userModel->findById($userId)['email'] . ($note ? ' (' . $note . ')' : '')
        ]);
        
        $this->notificationModel->create([
            'user_id' => $userId,
            'type' => 'wallet',
            'title' => 'Money Sent',
            'message' => 'You sent $' . number_format($amount, 2) . ' to ' . $recipient['email'] . '.',
            'action_url' => '/wallet'
        ]);
        
        $this->notificationModel->create([
            'user_id' => $recipient['id'],
            'type' => 'wallet',
            'title' => 'Money Received',
            'message' => 'You received $' . number_format($amount, 2) . ' from ' . $this->userModel->findById($userId)['email'] . '.',
            'action_url' => '/wallet'
        ]);
        
        Response::send(200, ['newBalance' => $newSenderBalance, 'message' => 'Transfer successful']);
    }

    // ========== NEW: Quick Pay ==========
    public function pay() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);

        $input = Security::getJsonInput();
        if (!$input || !isset($input['amount'])) {
            Response::send(400, ['error' => 'Amount required']);
        }

        $amount = (float)$input['amount'];
        if ($amount <= 0) {
            Response::send(400, ['error' => 'Invalid amount']);
        }

        $currentBalance = $this->userModel->getBalance($userId);
        if ($currentBalance < $amount) {
            Response::send(400, ['error' => 'Insufficient balance']);
        }

        $newBalance = $currentBalance - $amount;
        $this->userModel->updateBalance($userId, $newBalance);

        $this->transactionModel->create([
            'user_id' => $userId,
            'order_id' => null,
            'amount' => $amount,
            'type' => 'debit',
            'category' => 'dining',
            'description' => 'Restaurant payment of $' . number_format($amount, 2)
        ]);

        $this->notificationModel->create([
            'user_id' => $userId,
            'type' => 'wallet',
            'title' => 'Payment Made',
            'message' => 'You paid $' . number_format($amount, 2) . ' via Quick Pay.',
            'action_url' => '/wallet'
        ]);

        Response::send(200, ['newBalance' => $newBalance, 'message' => 'Payment successful']);
    }

    // ========== NEW: Money Request ==========
    public function requestMoney() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);

        $input = Security::getJsonInput();
        if (!$input || !isset($input['recipient_email']) || !isset($input['amount'])) {
            Response::send(400, ['error' => 'Recipient email and amount required']);
        }

        $amount = (float)$input['amount'];
        if ($amount <= 0) Response::send(400, ['error' => 'Invalid amount']);

        $recipient = $this->userModel->findByEmail($input['recipient_email']);
        if (!$recipient) Response::send(404, ['error' => 'Recipient not found']);
        if ($recipient['id'] == $userId) Response::send(400, ['error' => 'Cannot request from yourself']);

        $note = $input['note'] ?? '';

        $moneyRequestModel = new MoneyRequest($this->conn);
        $created = $moneyRequestModel->create($userId, $recipient['id'], $amount, $note);
        if (!$created) Response::send(500, ['error' => 'Failed to create request']);

        $this->notificationModel->create([
            'user_id' => $recipient['id'],
            'type' => 'wallet',
            'title' => 'Money Request',
            'message' => $this->userModel->findById($userId)['username'] . ' requested $' . number_format($amount, 2) . ' from you.',
            'action_url' => '/wallet?tab=requests'
        ]);

        Response::send(200, ['message' => 'Request sent successfully']);
    }

    public function getPendingRequests() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        $moneyRequestModel = new MoneyRequest($this->conn);
        $requests = $moneyRequestModel->getPendingForUser($userId);
        Response::send(200, $requests);
    }

    public function acceptRequest($requestId) {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);

        $moneyRequestModel = new MoneyRequest($this->conn);
        $request = $moneyRequestModel->findById($requestId);
        if (!$request) Response::send(404, ['error' => 'Request not found']);
        if ($request['recipient_id'] != $userId) Response::send(403, ['error' => 'Not authorized']);
        if ($request['status'] !== 'pending') Response::send(400, ['error' => 'Request already processed']);

        $amount = (float)$request['amount'];
        $requesterId = $request['requester_id'];

        $balance = $this->userModel->getBalance($userId);
        if ($balance < $amount) {
            Response::send(400, ['error' => 'Insufficient balance']);
        }

        $this->conn->beginTransaction();
        try {
            $newBalance = $balance - $amount;
            $this->userModel->updateBalance($userId, $newBalance);

            $requesterBalance = $this->userModel->getBalance($requesterId);
            $newRequesterBalance = $requesterBalance + $amount;
            $this->userModel->updateBalance($requesterId, $newRequesterBalance);

            $this->transactionModel->create([
                'user_id' => $userId,
                'order_id' => null,
                'amount' => $amount,
                'type' => 'debit',
                'category' => 'transfer',
                'description' => 'Sent to ' . $this->userModel->findById($requesterId)['email'] . ' (request accepted)'
            ]);
            $this->transactionModel->create([
                'user_id' => $requesterId,
                'order_id' => null,
                'amount' => $amount,
                'type' => 'credit',
                'category' => 'transfer',
                'description' => 'Received from ' . $this->userModel->findById($userId)['email'] . ' (request fulfilled)'
            ]);

            $moneyRequestModel->updateStatus($requestId, 'accepted');

            $this->notificationModel->create([
                'user_id' => $requesterId,
                'type' => 'wallet',
                'title' => 'Request Accepted',
                'message' => $this->userModel->findById($userId)['username'] . ' accepted your request for $' . number_format($amount, 2) . '.',
                'action_url' => '/wallet'
            ]);

            $this->conn->commit();
            Response::send(200, ['message' => 'Request accepted and money transferred']);
        } catch (Exception $e) {
            $this->conn->rollBack();
            Response::send(500, ['error' => 'Failed to accept request: ' . $e->getMessage()]);
        }
    }

    public function rejectRequest($requestId) {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);

        $moneyRequestModel = new MoneyRequest($this->conn);
        $request = $moneyRequestModel->findById($requestId);
        if (!$request) Response::send(404, ['error' => 'Request not found']);
        if ($request['recipient_id'] != $userId) Response::send(403, ['error' => 'Not authorized']);
        if ($request['status'] !== 'pending') Response::send(400, ['error' => 'Request already processed']);

        $moneyRequestModel->updateStatus($requestId, 'rejected');

        $this->notificationModel->create([
            'user_id' => $request['requester_id'],
            'type' => 'wallet',
            'title' => 'Request Rejected',
            'message' => $this->userModel->findById($userId)['username'] . ' rejected your request for $' . number_format($request['amount'], 2) . '.',
            'action_url' => '/wallet'
        ]);

        Response::send(200, ['message' => 'Request rejected']);
    }
}
?>