<?php
class MenuItem {
    private $conn;
    private $table = 'menu_items';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function findAll() {
        $query = "SELECT * FROM {$this->table} WHERE is_available = 1 ORDER BY sort_order, name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findAllAdmin() {
        $query = "SELECT * FROM {$this->table} ORDER BY sort_order, name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} (name, category, price, image, description, sort_order, is_available) 
                  VALUES (:name, :category, :price, :image, :description, :sort_order, :is_available)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':image', $data['image']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':sort_order', $data['sort_order']);
        $stmt->bindParam(':is_available', $data['is_available']);
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function update($id, $data) {
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }
        $query = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        foreach ($data as $key => &$value) {
            $stmt->bindParam(":$key", $value);
        }
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function countActive() {
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE is_available = 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$result['total'];
    }

    // ---------- Options Management ----------
    public function getOptions($itemId) {
        $query = "SELECT * FROM menu_item_options WHERE menu_item_id = :item_id ORDER BY sort_order";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':item_id', $itemId);
        $stmt->execute();
        $options = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($options as &$opt) {
            $opt['values'] = $this->getOptionValues($opt['id']);
        }
        return $options;
    }

    private function getOptionValues($optionId) {
        $query = "SELECT * FROM menu_item_option_values WHERE option_id = :option_id ORDER BY sort_order";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':option_id', $optionId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Add a new option with its values
     * @param int $itemId
     * @param string $name
     * @param array $values Array of ['name' => string, 'priceModifier' => float]
     * @return int|false The new option ID or false on failure
     */
    public function addOption($itemId, $name, $values = []) {
        $query = "INSERT INTO menu_item_options (menu_item_id, option_name) VALUES (:item_id, :name)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':item_id', $itemId);
        $stmt->bindParam(':name', $name);
        if ($stmt->execute()) {
            $optionId = $this->conn->lastInsertId();
            foreach ($values as $val) {
                $this->addOptionValue($optionId, $val['name'], $val['priceModifier']);
            }
            return $optionId;
        }
        return false;
    }

    /**
     * Update an existing option (name and values)
     * @param int $optionId
     * @param string $name
     * @param array $values Array of ['name' => string, 'priceModifier' => float]
     * @return bool
     */
    public function updateOption($optionId, $name, $values = []) {
        // Update option name
        $query = "UPDATE menu_item_options SET option_name = :name WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':id', $optionId);
        if (!$stmt->execute()) return false;

        // Replace all existing values
        $this->deleteOptionValues($optionId);
        foreach ($values as $val) {
            $this->addOptionValue($optionId, $val['name'], $val['priceModifier']);
        }
        return true;
    }

    public function addOptionValue($optionId, $valueName, $priceModifier) {
        $query = "INSERT INTO menu_item_option_values (option_id, value_name, price_modifier) VALUES (:option_id, :name, :modifier)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':option_id', $optionId);
        $stmt->bindParam(':name', $valueName);
        $stmt->bindParam(':modifier', $priceModifier);
        return $stmt->execute();
    }

    public function deleteOptionValues($optionId) {
        $query = "DELETE FROM menu_item_option_values WHERE option_id = :option_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':option_id', $optionId);
        return $stmt->execute();
    }

    public function deleteOption($optionId) {
        $this->deleteOptionValues($optionId);
        $query = "DELETE FROM menu_item_options WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $optionId);
        return $stmt->execute();
    }
}
?>