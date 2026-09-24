<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

try {

    // Connect to MongoDB
    $client = new Client(getenv("MONGODB_URI") ?: "mongodb://localhost:27017");

    // Select HireHub database
    $database = $client->selectDatabase("hirehub");

    // Select collections
    $users = $database->selectCollection("users");
    $candidates = $database->selectCollection("candidates");

    // Get JSON data from request
    $data = json_decode(file_get_contents("php://input"), true);

    // Check required fields
    if (
        empty($data['name']) ||
        empty($data['email']) ||
        empty($data['password']) ||
        empty($data['role'])
    ) {
        echo json_encode([
            "success" => false,
            "message" => "All required fields are required."
        ]);
        exit;
    }

    // Clean input
    $name = trim($data['name']);
    $email = strtolower(trim($data['email']));
    $password = $data['password'];
    $role = strtolower(trim($data['role']));
    $phone = isset($data['phone']) ? trim($data['phone']) : "";

    // Validate role
    if (!in_array($role, ["candidate", "employer"])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid role."
        ]);
        exit;
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email address."
        ]);
        exit;
    }

    // Check if email already exists
    $existingUser = $users->findOne([
        "email" => $email
    ]);

    if ($existingUser) {
        echo json_encode([
            "success" => false,
            "message" => "Email already registered."
        ]);
        exit;
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Create user
    $newUser = [
        "name" => $name,
        "email" => $email,
        "password" => $hashedPassword,
        "role" => $role,
        "phone" => $phone,
        "status" => "active",
        "created_at" => new UTCDateTime()
    ];

    // Insert user into MongoDB
    $result = $users->insertOne($newUser);

    $userId = $result->getInsertedId();

    // Automatically create candidate profile
    if ($role === "candidate") {

        $candidateProfile = [
            "user_id" => $userId,
            "full_name" => $name,
            "email" => $email,
            "phone" => $phone,
            "date_of_birth" => "",
            "gender" => "",

            "address" => [
                "city" => "",
                "state" => "",
                "country" => ""
            ],

            "education" => [],
            "skills" => [],
            "experience" => [],
            "resume" => null,

            "created_at" => new UTCDateTime(),
            "updated_at" => new UTCDateTime()
        ];

        $candidates->insertOne($candidateProfile);
    }

    echo json_encode([
        "success" => true,
        "message" => "Registration successful.",
        "user_id" => (string) $userId
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);
}

?>