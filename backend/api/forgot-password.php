<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

try {

    $client = new Client("mongodb://localhost:27017");

    $database = $client->selectDatabase("hirehub");

    $users = $database->selectCollection("users");

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['email'])) {
        echo json_encode([
            "success" => false,
            "message" => "Email is required."
        ]);
        exit;
    }

    $email = strtolower(trim($data['email']));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email address."
        ]);
        exit;
    }

    $user = $users->findOne([
        "email" => $email
    ]);

    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "No account found with this email."
        ]);
        exit;
    }

    $token = bin2hex(random_bytes(32));

    $expiresAt = new MongoDB\BSON\UTCDateTime(
        (time() + 3600) * 1000
    );

    $users->updateOne(
        [
            "_id" => $user["_id"]
        ],
        [
            '$set' => [
                "reset_token" => $token,
                "reset_token_expires" => $expiresAt
            ]
        ]
    );

    echo json_encode([
        "success" => true,
        "message" => "Password reset request created.",
        "reset_token" => $token
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);
}
?>