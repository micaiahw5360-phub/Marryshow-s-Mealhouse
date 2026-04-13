<?php
class Database {
    private $host = "localhost";
    private $db_name = "tamcc_deli_react";   // ← changed to match your SQL file
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // For JSON API, return a JSON error instead of plain text
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Database connection failed: ' . $exception->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
?>