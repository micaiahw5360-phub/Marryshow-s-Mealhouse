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

    public static function generateToken($userId, $expiresIn = 604800) { // default 7 days (604800 seconds)
    $issuedAt = time();
    $expire = $issuedAt + $expiresIn;

    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode([
        'user_id' => $userId,
        'iat' => $issuedAt,
        'exp' => $expire
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