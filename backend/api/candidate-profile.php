<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

try {

    $client = new Client(getenv("MONGODB_URI") ?: "mongodb://localhost:27017");
    $database = $client->selectDatabase("hirehub");
    $candidates = $database->selectCollection("candidates");

    $method = $_SERVER['REQUEST_METHOD'];

    /*
    |--------------------------------------------------------------------------
    | GET - View Profile
    |--------------------------------------------------------------------------
    */

    if ($method === 'GET') {

        if (empty($_GET['user_id'])) {
            echo json_encode([
                "success" => false,
                "message" => "user_id is required."
            ]);
            exit;
        }

        try {
            $userId = new ObjectId($_GET['user_id']);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid user ID."
            ]);
            exit;
        }

        $profile = $candidates->findOne([
            "user_id" => $userId
        ]);

        if (!$profile) {
            echo json_encode([
                "success" => false,
                "message" => "Candidate profile not found."
            ]);
            exit;
        }

        $profile['_id'] = (string) $profile['_id'];
        $profile['user_id'] = (string) $profile['user_id'];

        echo json_encode([
            "success" => true,
            "message" => "Candidate profile retrieved successfully.",
            "profile" => $profile
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST - Create Profile
    |--------------------------------------------------------------------------
    */

    if ($method === 'POST') {

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['user_id'])) {
            echo json_encode([
                "success" => false,
                "message" => "user_id is required."
            ]);
            exit;
        }

        try {
            $userId = new ObjectId($data['user_id']);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid user ID."
            ]);
            exit;
        }

        $existingProfile = $candidates->findOne([
            "user_id" => $userId
        ]);

        if ($existingProfile) {
            echo json_encode([
                "success" => false,
                "message" => "Candidate profile already exists."
            ]);
            exit;
        }

        $profile = [
            "user_id" => $userId,
            "full_name" => trim($data['full_name'] ?? ""),
            "email" => strtolower(trim($data['email'] ?? "")),
            "phone" => trim($data['phone'] ?? ""),
            "date_of_birth" => trim($data['date_of_birth'] ?? ""),
            "gender" => trim($data['gender'] ?? ""),

            "address" => [
                "city" => trim($data['city'] ?? ""),
                "state" => trim($data['state'] ?? ""),
                "country" => trim($data['country'] ?? "")
            ],

            "education" => $data['education'] ?? [],
            "skills" => $data['skills'] ?? [],
            "experience" => $data['experience'] ?? [],
            "resume" => null,

            "created_at" => new UTCDateTime(),
            "updated_at" => new UTCDateTime()
        ];

        $result = $candidates->insertOne($profile);

        echo json_encode([
            "success" => true,
            "message" => "Candidate profile created successfully.",
            "profile_id" => (string) $result->getInsertedId()
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | PUT - Update Profile
    |--------------------------------------------------------------------------
    */

    if ($method === 'PUT') {

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['user_id'])) {
            echo json_encode([
                "success" => false,
                "message" => "user_id is required."
            ]);
            exit;
        }

        try {
            $userId = new ObjectId($data['user_id']);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid user ID."
            ]);
            exit;
        }

        $existingProfile = $candidates->findOne([
            "user_id" => $userId
        ]);

        if (!$existingProfile) {
            echo json_encode([
                "success" => false,
                "message" => "Candidate profile not found."
            ]);
            exit;
        }

        $updateData = [];

        if (isset($data['full_name'])) {
            $updateData['full_name'] = trim($data['full_name']);
        }

        if (isset($data['email'])) {
            $updateData['email'] = strtolower(trim($data['email']));
        }

        if (isset($data['phone'])) {
            $updateData['phone'] = trim($data['phone']);
        }

        if (isset($data['date_of_birth'])) {
            $updateData['date_of_birth'] = trim($data['date_of_birth']);
        }

        if (isset($data['gender'])) {
            $updateData['gender'] = trim($data['gender']);
        }

        if (isset($data['city'])) {
            $updateData['address.city'] = trim($data['city']);
        }

        if (isset($data['state'])) {
            $updateData['address.state'] = trim($data['state']);
        }

        if (isset($data['country'])) {
            $updateData['address.country'] = trim($data['country']);
        }

        if (isset($data['education'])) {
            $updateData['education'] = $data['education'];
        }

        if (isset($data['skills'])) {
            $updateData['skills'] = $data['skills'];
        }

        if (isset($data['experience'])) {
            $updateData['experience'] = $data['experience'];
        }

        if (empty($updateData)) {
            echo json_encode([
                "success" => false,
                "message" => "No fields provided for update."
            ]);
            exit;
        }

        $updateData['updated_at'] = new UTCDateTime();

        $result = $candidates->updateOne(
            ["user_id" => $userId],
            ['$set' => $updateData]
        );

        echo json_encode([
            "success" => true,
            "message" => "Candidate profile updated successfully.",
            "modified_count" => $result->getModifiedCount()
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE - Delete Profile
    |--------------------------------------------------------------------------
    */

    if ($method === 'DELETE') {

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['user_id'])) {
            echo json_encode([
                "success" => false,
                "message" => "user_id is required."
            ]);
            exit;
        }

        try {
            $userId = new ObjectId($data['user_id']);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid user ID."
            ]);
            exit;
        }

        $result = $candidates->deleteOne([
            "user_id" => $userId
        ]);

        if ($result->getDeletedCount() === 0) {
            echo json_encode([
                "success" => false,
                "message" => "Candidate profile not found."
            ]);
            exit;
        }

        echo json_encode([
            "success" => true,
            "message" => "Candidate profile deleted successfully."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Unsupported Method
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => false,
        "message" => "Unsupported request method."
    ]);

    exit;


} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);

    exit;
}

?>