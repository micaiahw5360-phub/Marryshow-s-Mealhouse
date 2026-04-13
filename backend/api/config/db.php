<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Use environment variables on Render, fallback to local defaults
        $this->host = getenv('DB_HOST') ?: "localhost";
        $this->db_name = getenv('DB_DATABASE') ?: "tamcc_deli_react";
        $this->username = getenv('DB_USERNAME') ?: "root";
        $this->password = getenv('DB_PASSWORD') ?: "";
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Database connection failed: ' . $exception->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
?>