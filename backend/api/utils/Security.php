<?php
class Security {
    private static $secret_key = "marryshow-mealhouses"; // Change to a strong key

    public static function verifyToken($token) {
        if (!$token) return false;
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) return false;
            $payload = json_decode(base64_decode($parts[1]), true);
            if (!$payload || !isset($payload['user_id']) || (isset($payload['exp']) && $payload['exp'] < time())) {
                return false;
            }
            return $payload['user_id'];
        } catch (Exception $e) {
            return false;
        }
    }

    public static function generateToken($userId) {
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = base64_encode(json_encode([
            'user_id' => $userId,
            'exp' => time() + (86400 * 7) // 7 days
        ]));
        $signature = hash_hmac('sha256', "$header.$payload", self::$secret_key, true);
        $signature = base64_encode($signature);
        return "$header.$payload.$signature";
    }

    public static function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true);
    }
}
?>