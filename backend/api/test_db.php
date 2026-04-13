<?php
require_once 'config/db.php';
$db = new Database();
$conn = $db->getConnection();
if($conn) echo "Connected to database successfully!";
else echo "Connection failed.";
?>