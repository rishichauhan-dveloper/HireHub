<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
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

    $client = new Client("mongodb://localhost:27017");

    $database = $client->selectDatabase("hirehub");

    $candidates = $database->selectCollection("candidates");

    $method = $_SERVER['REQUEST_METHOD'];


    /*
    |--------------------------------------------------------------------------
    | GET - Get Candidate Resume
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

        $candidate = $candidates->findOne([
            "user_id" => $userId
        ]);

        if (!$candidate) {

            echo json_encode([
                "success" => false,
                "message" => "Candidate profile not found."
            ]);
            exit;
        }

        /*
        |--------------------------------------------------------------------------
        | Resume exists
        |--------------------------------------------------------------------------
        */

        if (!isset($candidate['resume_builder'])) {

            echo json_encode([
                "success" => true,
                "message" => "Resume not created yet.",
                "resume" => null
            ]);
            exit;
        }

        $resume = $candidate['resume_builder'];

        echo json_encode([
            "success" => true,
            "message" => "Resume retrieved successfully.",
            "resume" => $resume
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST - Create / Update Candidate Resume
    |--------------------------------------------------------------------------
    */

    if ($method === 'POST') {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

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

        /*
        |--------------------------------------------------------------------------
        | Check Candidate
        |--------------------------------------------------------------------------
        */

        $candidate = $candidates->findOne([
            "user_id" => $userId
        ]);

        if (!$candidate) {

            echo json_encode([
                "success" => false,
                "message" => "Candidate profile not found."
            ]);
            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Resume Data
        |--------------------------------------------------------------------------
        */

        $resumeData = [

            "headline" => trim(
                $data['headline'] ?? ""
            ),

            "summary" => trim(
                $data['summary'] ?? ""
            ),

            "skills" => trim(
                $data['skills'] ?? ""
            ),

            "education" => trim(
                $data['education'] ?? ""
            ),

            "experience" => trim(
                $data['experience'] ?? ""
            ),

            "certifications" => trim(
                $data['certifications'] ?? ""
            ),

            "updated_at" => new UTCDateTime()

        ];


        /*
        |--------------------------------------------------------------------------
        | Save Resume
        |--------------------------------------------------------------------------
        */

        $result = $candidates->updateOne(
            [
                "user_id" => $userId
            ],
            [
                '$set' => [
                    "resume_builder" => $resumeData,
                    "updated_at" => new UTCDateTime()
                ]
            ]
        );


        echo json_encode([
            "success" => true,
            "message" => "Resume saved successfully.",
            "resume" => $resumeData,
            "modified_count" => $result->getModifiedCount()
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
        "message" => "Method not allowed."
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);

}

?>