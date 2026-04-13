<?php
class Response {
    public static function send($status, $data) {
        http_response_code($status);
        echo json_encode($data);
        exit();
    }
}
?>