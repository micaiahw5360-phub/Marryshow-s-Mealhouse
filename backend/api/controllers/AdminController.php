<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/MenuItem.php';
require_once __DIR__ . '/../models/Option.php';
require_once __DIR__ . '/../models/OrderItem.php';

class AdminController {
    private $userModel;
    private $orderModel;
    private $menuItemModel;
    private $optionModel;
    private $orderItemModel;
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->userModel = new User($this->conn);
        $this->orderModel = new Order($this->conn);
        $this->menuItemModel = new MenuItem($this->conn);
        $this->optionModel = new Option($this->conn);
        $this->orderItemModel = new OrderItem($this->conn);
    }

    private function isAdmin() {
        $headers = getallheaders();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
        $userId = Security::verifyToken($token);
        if (!$userId) return false;
        $user = $this->userModel->findById($userId);
        return $user && $user['role'] === 'admin';
    }

    // ========== STATS ==========
    public function getStats() {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $totalOrders = $this->orderModel->countAll();
        $pendingOrders = $this->orderModel->countByStatus('pending');
        $totalUsers = $this->userModel->countAll();
        $activeMenuItems = $this->menuItemModel->countActive();
        Response::send(200, compact('totalOrders', 'pendingOrders', 'totalUsers', 'activeMenuItems'));
    }

    public function getWeeklySales() {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $data = $this->orderModel->getWeeklySales();
        Response::send(200, $data);
    }

    public function getPopularItems() {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $data = $this->orderItemModel->getPopularItems();
        Response::send(200, $data);
    }

    public function getRecentOrders() {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $orders = $this->orderModel->getRecentOrders(10);
        Response::send(200, $orders);
    }

    // ========== ORDERS ==========
    public function getAllOrders() {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $orders = $this->orderModel->findAll();
        foreach ($orders as &$order) {
            $order['items'] = $this->orderItemModel->findByOrderId($order['id']);
        }
        Response::send(200, $orders);
    }

    public function getOrderById($orderId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $order = $this->orderModel->findById($orderId);
        if (!$order) Response::send(404, ['error' => 'Order not found']);
        $order['items'] = $this->orderItemModel->findByOrderId($orderId);
        Response::send(200, $order);
    }

    public function updateOrderStatus($orderId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $input = Security::getJsonInput();
        if (!$input || !isset($input['status'])) Response::send(400, ['error' => 'Status required']);
        $this->orderModel->updateStatus($orderId, $input['status']);
        Response::send(200, ['message' => 'Order status updated']);
    }

    // ========== USERS ==========
    public function getAllUsers() {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $users = $this->userModel->getAll();
        Response::send(200, $users);
    }

    public function toggleUserActive($userId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $user = $this->userModel->findById($userId);
        if (!$user) Response::send(404, ['error' => 'User not found']);
        $newActive = !$user['is_active'];
        $this->userModel->update($userId, ['is_active' => $newActive ? 1 : 0]);
        Response::send(200, ['message' => 'User active status toggled']);
    }

    // Modified updateUser – password is NOT updated here (handled separately)
    public function updateUser($userId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        
        $input = Security::getJsonInput();
        if (!$input) Response::send(400, ['error' => 'No data provided']);
        
        $updateData = [];
        if (isset($input['username'])) $updateData['username'] = $input['username'];
        if (isset($input['email'])) $updateData['email'] = $input['email'];
        if (isset($input['role'])) $updateData['role'] = $input['role'];
        if (isset($input['walletBalance'])) $updateData['balance'] = (float)$input['walletBalance'];
        if (isset($input['active'])) $updateData['is_active'] = $input['active'] ? 1 : 0;
        // Password is handled separately via updateUserPassword
        
        if (empty($updateData)) {
            Response::send(400, ['error' => 'No valid fields to update']);
        }
        
        $result = $this->userModel->update($userId, $updateData);
        if ($result) {
            Response::send(200, ['message' => 'User updated successfully']);
        } else {
            Response::send(500, ['error' => 'Failed to update user']);
        }
    }

    // NEW: Delete a user
    public function deleteUser($userId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $user = $this->userModel->findById($userId);
        if (!$user) Response::send(404, ['error' => 'User not found']);
        $result = $this->userModel->delete($userId);
        if ($result) {
            Response::send(200, ['message' => 'User deleted successfully']);
        } else {
            Response::send(500, ['error' => 'Failed to delete user']);
        }
    }

    // NEW: Update a user's password (admin only)
    public function updateUserPassword($userId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $input = Security::getJsonInput();
        if (!$input || !isset($input['password'])) {
            Response::send(400, ['error' => 'New password required']);
        }
        $hashed = password_hash($input['password'], PASSWORD_DEFAULT);
        $result = $this->userModel->updatePassword($userId, $hashed);
        if ($result) {
            Response::send(200, ['message' => 'Password updated']);
        } else {
            Response::send(500, ['error' => 'Failed to update password']);
        }
    }

    // ========== ITEMS ==========
    public function getAllItems() {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $items = $this->menuItemModel->findAllAdmin();
        Response::send(200, $items);
    }

    public function createItem() {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $input = Security::getJsonInput();
        if (!$input || !isset($input['name']) || !isset($input['category']) || !isset($input['price'])) {
            Response::send(400, ['error' => 'Missing required fields: name, category, price']);
        }
        $input['is_available'] = 1;
        if (!isset($input['sort_order'])) {
            $input['sort_order'] = 0;
        }
        $id = $this->menuItemModel->create($input);
        if ($id) {
            Response::send(201, ['id' => $id, 'message' => 'Item created']);
        } else {
            Response::send(500, ['error' => 'Failed to create item']);
        }
    }

    public function updateItem($itemId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $input = Security::getJsonInput();
        if (!$input) Response::send(400, ['error' => 'No data provided']);
        $result = $this->menuItemModel->update($itemId, $input);
        if ($result) {
            Response::send(200, ['message' => 'Item updated']);
        } else {
            Response::send(500, ['error' => 'Failed to update item']);
        }
    }

    public function deleteItem($itemId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $result = $this->menuItemModel->delete($itemId);
        if ($result) {
            Response::send(200, ['message' => 'Item deleted']);
        } else {
            Response::send(500, ['error' => 'Failed to delete item']);
        }
    }

    // ========== OPTIONS ==========
    public function getOptions($itemId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $options = $this->menuItemModel->getOptions($itemId);
        Response::send(200, $options);
    }

    public function addOption($itemId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $input = Security::getJsonInput();
        if (!$input || !isset($input['name'])) {
            Response::send(400, ['error' => 'Option name required']);
        }
        $values = $input['values'] ?? [];
        $optionId = $this->menuItemModel->addOption($itemId, $input['name'], $values);
        if ($optionId) {
            Response::send(201, ['id' => $optionId, 'message' => 'Option added']);
        } else {
            Response::send(500, ['error' => 'Failed to add option']);
        }
    }

    public function updateOption($optionId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $input = Security::getJsonInput();
        if (!$input || !isset($input['name'])) {
            Response::send(400, ['error' => 'Option name required']);
        }
        $values = $input['values'] ?? [];
        $result = $this->menuItemModel->updateOption($optionId, $input['name'], $values);
        if ($result) {
            Response::send(200, ['message' => 'Option updated']);
        } else {
            Response::send(500, ['error' => 'Failed to update option']);
        }
    }

    public function deleteOption($optionId) {
        if (!$this->isAdmin()) Response::send(403, ['error' => 'Forbidden']);
        $result = $this->menuItemModel->deleteOption($optionId);
        if ($result) {
            Response::send(200, ['message' => 'Option deleted']);
        } else {
            Response::send(500, ['error' => 'Failed to delete option']);
        }
    }
}
?>