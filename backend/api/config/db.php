<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    public $conn;

    public function __construct() {
        $this->host = getenv('DB_HOST') ?: "localhost";
        $this->db_name = getenv('DB_DATABASE') ?: "tamcc_deli_react";
        $this->username = getenv('DB_USERNAME') ?: "root";
        $this->password = getenv('DB_PASSWORD') ?: "";
        $this->port = getenv('DB_PORT') ?: "3306";
    }

    public function getConnection() {
        $this->conn = null;
        try {
            // DSN with SSL options for Aiven
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4";
            
            // SSL options (required for Aiven)
            $options = [
                PDO::MYSQL_ATTR_SSL_CA => __DIR__ . '/config/ca.pem',   // path to your CA cert
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
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