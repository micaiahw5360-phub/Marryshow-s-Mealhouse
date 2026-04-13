<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../models/MenuItem.php';

class ItemsController {
    private $menuItemModel;

    public function __construct() {
        $database = new Database();
        $conn = $database->getConnection();
        $this->menuItemModel = new MenuItem($conn);
    }

    public function getItems() {
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $items = $this->menuItemModel->findAll();
        if ($category) {
            $items = array_filter($items, fn($item) => $item['category'] === $category);
            $items = array_values($items);
        }
        // Normalize numeric fields
        foreach ($items as &$item) {
            $item['id'] = (int)$item['id'];
            $item['price'] = (float)$item['price'];
        }
        Response::send(200, $items);
    }

    public function getItem($id) {
        $item = $this->menuItemModel->findById($id);
        if (!$item) Response::send(404, ['error' => 'Item not found']);
        $item['id'] = (int)$item['id'];
        $item['price'] = (float)$item['price'];
        $options = $this->menuItemModel->getOptions($id);
        $item['options'] = $options;
        Response::send(200, $item);
    }

    public function getCategories() {
        $items = $this->menuItemModel->findAll();
        $categories = array_unique(array_column($items, 'category'));
        sort($categories);
        Response::send(200, $categories);
    }
}
?>