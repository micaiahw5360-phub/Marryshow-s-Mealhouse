<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';

class FavoritesController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    private function getUserId() {
        $headers = getallheaders();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
        return Security::verifyToken($token);
    }

    // GET /favorites
    public function get() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        
        $query = "SELECT menu_item_id FROM user_favorites WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $favorites = $stmt->fetchAll(PDO::FETCH_COLUMN);
        Response::send(200, $favorites);
    }

    // POST /favorites
    public function post() {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        
        $input = Security::getJsonInput();
        if (!$input || !isset($input['menu_item_id'])) {
            Response::send(400, ['error' => 'menu_item_id required']);
        }
        
        $menuItemId = (int)$input['menu_item_id'];
        
        // Check if already exists
        $check = "SELECT 1 FROM user_favorites WHERE user_id = :user_id AND menu_item_id = :item_id";
        $stmt = $this->conn->prepare($check);
        $stmt->execute([':user_id' => $userId, ':item_id' => $menuItemId]);
        if ($stmt->fetch()) {
            Response::send(409, ['error' => 'Already in favorites']);
        }
        
        $query = "INSERT INTO user_favorites (user_id, menu_item_id) VALUES (:user_id, :item_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':item_id', $menuItemId);
        if ($stmt->execute()) {
            Response::send(201, ['message' => 'Added to favorites']);
        } else {
            Response::send(500, ['error' => 'Failed to add']);
        }
    }

    // DELETE /favorites/{menuItemId}
    public function delete($menuItemId) {
        $userId = $this->getUserId();
        if (!$userId) Response::send(401, ['error' => 'Unauthorized']);
        
        $query = "DELETE FROM user_favorites WHERE user_id = :user_id AND menu_item_id = :item_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':item_id', $menuItemId);
        if ($stmt->execute()) {
            Response::send(200, ['message' => 'Removed from favorites']);
        } else {
            Response::send(500, ['error' => 'Failed to remove']);
        }
    }
}
?>