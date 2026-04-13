<?php
class Option {
    private $conn;
    private $table = 'menu_item_options';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all options for a menu item – used by AdminController::getOptions()
     */
    public function findByItemId($itemId) {
        $query = "SELECT * FROM " . $this->table . " WHERE menu_item_id = :item_id ORDER BY sort_order";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':item_id', $itemId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create a new option – used by AdminController::addOption()
     */
    public function create($itemId, $name, $values) {
        $query = "INSERT INTO " . $this->table . " (menu_item_id, option_name, option_type, required) 
                  VALUES (:item_id, :name, 'radio', 0)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':item_id', $itemId);
        $stmt->bindParam(':name', $name);
        $stmt->execute();
        $optionId = $this->conn->lastInsertId();

        // Insert option values into menu_item_option_values
        if (!empty($values) && is_array($values)) {
            $valueQuery = "INSERT INTO menu_item_option_values (option_id, value_name, price_modifier) 
                           VALUES (:opt_id, :val_name, :price)";
            $valueStmt = $this->conn->prepare($valueQuery);
            foreach ($values as $val) {
                $valueStmt->bindParam(':opt_id', $optionId);
                $valueStmt->bindParam(':val_name', $val['name']);
                $valueStmt->bindParam(':price', $val['priceModifier']);
                $valueStmt->execute();
            }
        }
        return $optionId;
    }

    /**
     * Update an option – used by AdminController::updateOption()
     */
    public function update($optionId, $data) {
        $query = "UPDATE " . $this->table . " SET option_name = :name WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':id', $optionId);
        return $stmt->execute();
    }

    /**
     * Delete an option – used by AdminController::deleteOption()
     */
    public function delete($optionId) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $optionId);
        return $stmt->execute();
    }
}
?>