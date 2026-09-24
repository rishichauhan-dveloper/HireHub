<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

try {

    // Connect to MongoDB
    $client = new Client(getenv("MONGODB_URI") ?: "mongodb://localhost:27017");

    // Select database and collection
    $database = $client->selectDatabase("hirehub");
    $users = $database->selectCollection("users");

    // Get JSON request
    $data = json_decode(file_get_contents("php://input"), true);

    // Check required fields
    if (empty($data['email']) || empty($data['password'])) {
        echo json_encode([
            "success" => false,
            "message" => "Email and password are required."
        ]);
        exit;
    }

    // Clean input
    $email = strtolower(trim($data['email']));
    $password = $data['password'];

    // Find user
    $user = $users->findOne([
        "email" => $email
    ]);

    // User not found
    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);
        exit;
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);
        exit;
    }

    // Check account status
    if ($user['status'] !== "active") {
        echo json_encode([
            "success" => false,
            "message" => "Your account is not active."
        ]);
        exit;
    }

    // Successful login
    echo json_encode([
        "success" => true,
        "message" => "Login successful.",
        "user" => [
            "id" => (string) $user['_id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $user['role'],
            "phone" => $user['phone']
        ]
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);
}

?>