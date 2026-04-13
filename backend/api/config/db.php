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
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            // Try to add SSL if CA certificate exists
            $caCertPath = __DIR__ . '/ca.pem';
            if (file_exists($caCertPath)) {
                $options[PDO::MYSQL_ATTR_SSL_CA] = $caCertPath;
                // For Aiven, we often don't need to verify the server cert, but it's safer to set:
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
            } else {
                error_log("Warning: CA certificate not found at $caCertPath. Connecting without SSL.");
            }

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