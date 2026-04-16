<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Resend\Resend;

class Email {
    private static $resend;

    private static function init() {
        if (!self::$resend) {
            $apiKey = getenv('RESEND_API_KEY');
            if (!$apiKey) {
                error_log('RESEND_API_KEY not set');
                return false;
            }
            self::$resend = new Resend($apiKey);
        }
        return true;
    }

    /**
     * Send a plain text or HTML email
     */
    public static function send($to, $subject, $htmlContent, $textContent = null) {
        if (!self::init()) {
            return ['error' => 'Email service not configured'];
        }

        try {
            $params = [
                'from' => 'Marryshow\'s Mealhouse <noreply@marryshowsmealhouse.com>',
                'to' => $to,
                'subject' => $subject,
                'html' => $htmlContent,
            ];
            if ($textContent) {
                $params['text'] = $textContent;
            }
            $result = self::$resend->emails->send($params);
            return ['success' => true, 'id' => $result->id];
        } catch (Exception $e) {
            error_log('Resend error: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Send order confirmation email
     */
    public static function sendOrderConfirmation($userEmail, $userName, $orderId, $total, $items) {
        $itemsHtml = '';
        foreach ($items as $item) {
            $itemsHtml .= "<tr><td>{$item['quantity']} x {$item['name']}</td><td>\${$item['price']}</td></tr>";
        }

        $html = "
        <h2>Order Confirmation #$orderId</h2>
        <p>Hello $userName,</p>
        <p>Thank you for your order! Your food is being prepared.</p>
        <h3>Order Summary</h3>
        <table border='0' cellpadding='5'>
            <tr><th>Item</th><th>Price</th></tr>
            $itemsHtml
            <tr><td><strong>Total</strong></td><td><strong>\$$total</strong></td></tr>
        </table>
        <p>Pickup time: Approximately 15-20 minutes.</p>
        <p>We'll notify you when your order is ready.</p>
        <br>
        <p>Marryshow's Mealhouse</p>
        ";

        return self::send($userEmail, "Order Confirmed #$orderId", $html);
    }

    /**
     * Send password reset email
     */
    public static function sendPasswordReset($userEmail, $resetLink) {
        $html = "
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <p><a href='$resetLink'>$resetLink</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
        ";

        return self::send($userEmail, "Reset Your Password", $html);
    }

    /**
     * Send welcome email after registration
     */
    public static function sendWelcomeEmail($userEmail, $userName) {
        $html = "
        <h2>Welcome to Marryshow's Mealhouse!</h2>
        <p>Hello $userName,</p>
        <p>Thank you for joining us. Start ordering your favourite meals online and skip the lines!</p>
        <p>Your Marryshow Card number is available in your profile.</p>
        <p>Happy eating!</p>
        ";

        return self::send($userEmail, "Welcome to Marryshow's Mealhouse", $html);
    }
}