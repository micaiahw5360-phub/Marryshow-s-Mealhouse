<?php
// === Global error handler to ensure JSON output ===
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => "PHP Error: $errstr in $errfile on line $errline"]);
    exit;
});
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Fatal error: ' . $error['message']]);
        exit;
    }
});
// === End error handler ===

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/Security.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/RegisterController.php';
require_once __DIR__ . '/controllers/ItemsController.php';
require_once __DIR__ . '/controllers/OrdersController.php';
require_once __DIR__ . '/controllers/WalletController.php';
require_once __DIR__ . '/controllers/FavoritesController.php';
require_once __DIR__ . '/controllers/NotificationsController.php';
require_once __DIR__ . '/controllers/ProfileController.php';

$requestUri = $_SERVER['REQUEST_URI'];
$apiPos = strpos($requestUri, '/api');
if ($apiPos !== false) {
    $endpoint = substr($requestUri, $apiPos + 4);
} else {
    $endpoint = $requestUri;
}
$endpoint = trim($endpoint, '/');
$path = explode('/', $endpoint);
$requestMethod = $_SERVER['REQUEST_METHOD'];

if (empty($path[0])) {
    Response::send(200, ['message' => 'API is running']);
}

switch ($path[0]) {
    case 'login':
        $controller = new AuthController();
        $controller->post();
        break;
    case 'register':
        $controller = new RegisterController();
        $controller->post();
        break;
    case 'forgot-password':
        $controller = new AuthController();
        if ($requestMethod === 'POST') {
            $controller->forgotPassword();
        } else {
            Response::send(405, ['error' => 'Method not allowed']);
        }
        break;
    case 'reset-password':
        $controller = new AuthController();
        if ($requestMethod === 'POST') {
            $controller->resetPassword();
        } else {
            Response::send(405, ['error' => 'Method not allowed']);
        }
        break;
    case 'items':
        $controller = new ItemsController();
        if (isset($path[1]) && is_numeric($path[1])) {
            $controller->getItem((int)$path[1]);
        } else {
            $controller->getItems();
        }
        break;
    case 'categories':
        $itemsController = new ItemsController();
        $itemsController->getCategories();
        break;
    case 'orders':
        $controller = new OrdersController();
        if ($requestMethod === 'GET') {
            if (isset($path[1]) && is_numeric($path[1])) {
                $controller->get((int)$path[1]);
            } else {
                $controller->getUserOrders();
            }
        } elseif ($requestMethod === 'POST') {
            $controller->post();
        } else {
            Response::send(405, ['error' => 'Method not allowed']);
        }
        break;
    case 'wallet':
        $controller = new WalletController();
        if ($requestMethod === 'GET') {
            if (isset($path[1]) && $path[1] === 'transactions') {
                $controller->getTransactions();
            } elseif (isset($path[1]) && $path[1] === 'summary') {
                $controller->getSummary();
            } elseif (isset($path[1]) && $path[1] === 'requests' && isset($path[2]) && $path[2] === 'pending') {
                $controller->getPendingRequests();
            } else {
                $controller->get();
            }
        } elseif ($requestMethod === 'POST') {
            if (isset($path[1]) && $path[1] === 'topup') {
                $controller->topUp();
            } elseif (isset($path[1]) && $path[1] === 'transfer') {
                $controller->transfer();
            } elseif (isset($path[1]) && $path[1] === 'pay') {
                $controller->pay();
            } elseif (isset($path[1]) && $path[1] === 'request') {
                $controller->requestMoney();
            } elseif (isset($path[1]) && $path[1] === 'requests' && isset($path[2]) && $path[2] === 'accept') {
                $controller->acceptRequest($path[3] ?? null);
            } elseif (isset($path[1]) && $path[1] === 'requests' && isset($path[2]) && $path[2] === 'reject') {
                $controller->rejectRequest($path[3] ?? null);
            } else {
                Response::send(405, ['error' => 'Method not allowed']);
            }
        } else {
            Response::send(405, ['error' => 'Method not allowed']);
        }
        break;
    case 'favorites':
        $controller = new FavoritesController();
        if ($requestMethod === 'GET') {
            $controller->get();
        } elseif ($requestMethod === 'POST') {
            $controller->post();
        } elseif ($requestMethod === 'DELETE' && isset($path[1])) {
            $controller->delete((int)$path[1]);
        } else {
            Response::send(405, ['error' => 'Method not allowed']);
        }
        break;
    case 'notifications':
        $controller = new NotificationsController();
        if ($requestMethod === 'GET') {
            $controller->get();
        } elseif ($requestMethod === 'POST' && isset($path[2]) && $path[2] === 'read') {
            $controller->markAsRead((int)$path[1]);
        } elseif ($requestMethod === 'DELETE' && isset($path[1])) {
            $controller->delete((int)$path[1]);
        } else {
            Response::send(405, ['error' => 'Method not allowed']);
        }
        break;
    case 'profile':
        $controller = new ProfileController();
        if ($requestMethod === 'GET') {
            if (isset($path[1]) && $path[1] === 'notifications') {
                $controller->getNotificationPrefs();
            } else {
                $controller->get();
            }
        } elseif ($requestMethod === 'PUT') {
            if (isset($path[1]) && $path[1] === 'password') {
                $controller->changePassword();
            } elseif (isset($path[1]) && $path[1] === 'notifications') {
                $controller->updateNotificationPrefs();
            } else {
                $controller->put();
            }
        } elseif ($requestMethod === 'POST' && isset($path[1]) && $path[1] === 'avatar') {
            $controller->uploadAvatar();
        } else {
            Response::send(405, ['error' => 'Method not allowed']);
        }
        break;
    case 'admin':
        require_once __DIR__ . '/controllers/AdminController.php';
        $adminController = new AdminController();
        $resource = $path[1] ?? null;
        $id = isset($path[2]) && is_numeric($path[2]) ? (int)$path[2] : null;
        $subResource = $path[3] ?? null;

        if ($requestMethod === 'GET') {
            if (!$resource) Response::send(400, ['error' => 'Missing admin endpoint']);
            switch ($resource) {
                case 'stats': $adminController->getStats(); break;
                case 'sales-weekly': $adminController->getWeeklySales(); break;
                case 'popular-items': $adminController->getPopularItems(); break;
                case 'recent-orders': $adminController->getRecentOrders(); break;
                case 'orders':
                    if ($id) $adminController->getOrderById($id);
                    else $adminController->getAllOrders();
                    break;
                case 'users': $adminController->getAllUsers(); break;
                case 'items':
                    if ($id && $subResource === 'options') $adminController->getOptions($id);
                    else $adminController->getAllItems();
                    break;
                default: Response::send(404, ['error' => 'Admin endpoint not found']);
            }
        } elseif ($requestMethod === 'POST') {
            if ($resource === 'items') {
                if ($id && $subResource === 'options') $adminController->addOption($id);
                elseif (!$id) $adminController->createItem();
                else Response::send(404, ['error' => 'Invalid POST endpoint']);
            } else {
                Response::send(404, ['error' => 'Admin POST endpoint not found']);
            }
        } elseif ($requestMethod === 'PUT') {
            if ($resource === 'orders' && $subResource === 'status') {
                $adminController->updateOrderStatus($id);
            } elseif ($resource === 'users' && $id) {
                if ($subResource === 'password') {
                    $adminController->updateUserPassword($id);
                } else {
                    $adminController->updateUser($id);
                }
            } elseif ($resource === 'users' && $subResource === 'toggle-active') {
                $adminController->toggleUserActive($id);
            } elseif ($resource === 'items' && $id) {
                $adminController->updateItem($id);
            } elseif ($resource === 'options' && $id) {
                $adminController->updateOption($id);
            } else {
                Response::send(404, ['error' => 'Admin PUT endpoint not found']);
            }
        } elseif ($requestMethod === 'DELETE') {
            if ($resource === 'items' && $id) {
                $adminController->deleteItem($id);
            } elseif ($resource === 'options' && $id) {
                $adminController->deleteOption($id);
            } elseif ($resource === 'users' && $id) {
                $adminController->deleteUser($id);
            } else {
                Response::send(404, ['error' => 'Admin DELETE endpoint not found']);
            }
        } else {
            Response::send(405, ['error' => 'Method not allowed']);
        }
        break;
    case 'staff':
        require_once __DIR__ . '/controllers/StaffController.php';
        $staffController = new StaffController();
        if ($requestMethod === 'GET') {
            if (isset($path[1]) && $path[1] === 'stream') {
                $staffController->streamOrders();
            } elseif (isset($path[1]) && $path[1] === 'metrics') {
                $staffController->getMetrics();
            } elseif (isset($path[1]) && $path[1] === 'orders') {
                $staffController->getOrders();
            } else {
                Response::send(404, ['error' => 'Staff endpoint not found']);
            }
        } elseif ($requestMethod === 'PUT') {
            if (isset($path[1]) && $path[1] === 'orders' && isset($path[3]) && $path[3] === 'status') {
                $staffController->updateOrderStatus((int)$path[2]);
            } else {
                Response::send(404, ['error' => 'Staff PUT endpoint not found']);
            }
        } else {
            Response::send(405, ['error' => 'Method not allowed']);
        }
        break;
    case 'auth':
        $controller = new AuthController();
        $subPath = $path[1] ?? null;
        if ($subPath === 'google' && $requestMethod === 'POST') {
            $controller->googleAuth();
        } else {
            Response::send(404, ['error' => 'Auth endpoint not found']);
        }
        break;
    // ========== NEW KIOSK ROUTES (card‑based) ==========
    case 'kiosk':
        require_once __DIR__ . '/../controllers/KioskController.php';
        $kioskController = new KioskController();
        $subPath = $path[1] ?? null;
        $method = $_SERVER['REQUEST_METHOD'];

        if ($subPath === 'auth' && $method === 'POST') {
            $kioskController->authenticateWithCard();
        } elseif ($subPath === 'order' && $method === 'POST') {
            $kioskController->placeWalletOrder();
        } elseif ($subPath === 'balance' && $method === 'GET') {
            $kioskController->getBalanceByCard();
        } else {
            Response::send(404, ['error' => 'Kiosk endpoint not found']);
        }
        break;
    default:
        Response::send(404, ['error' => 'Endpoint not found']);
}
?>