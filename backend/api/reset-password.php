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

    if (
        empty($data['token']) ||
        empty($data['password'])
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Reset token and password are required."
        ]);
        exit;
    }

    $token = trim($data['token']);
    $password = $data['password'];

    if (strlen($password) < 6) {
        echo json_encode([
            "success" => false,
            "message" => "Password must be at least 6 characters."
        ]);
        exit;
    }

    $user = $users->findOne([
        "reset_token" => $token
    ]);

    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid reset token."
        ]);
        exit;
    }

    if (
        !isset($user['reset_token_expires']) ||
        $user['reset_token_expires']->toDateTime()->getTimestamp() < time()
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Reset token has expired."
        ]);
        exit;
    }

    $hashedPassword = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $users->updateOne(
        [
            "_id" => $user["_id"]
        ],
        [
            '$set' => [
                "password" => $hashedPassword
            ],
            '$unset' => [
                "reset_token" => "",
                "reset_token_expires" => ""
            ]
        ]
    );

    echo json_encode([
        "success" => true,
        "message" => "Password reset successfully."
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);
}

?>