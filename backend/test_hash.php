<?php
$hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
$pin = '1234';
if (password_verify($pin, $hash)) {
    echo "PIN matches!";
} else {
    echo "PIN does NOT match.";
}