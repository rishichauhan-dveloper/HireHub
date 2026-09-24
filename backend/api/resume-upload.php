<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
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

    /*
    |--------------------------------------------------------------------------
    | GET - Get uploaded resume file information
    |--------------------------------------------------------------------------
    */

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {

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

        echo json_encode([
            "success" => true,
            "resume" => $candidate['resume_file'] ?? null
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE - Delete uploaded resume file
    |--------------------------------------------------------------------------
    */

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

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

        $resume = $candidate['resume_file'] ?? null;

        if (!$resume) {
            echo json_encode([
                "success" => false,
                "message" => "No uploaded resume found."
            ]);
            exit;
        }

        /*
        |--------------------------------------------------------------------------
        | Delete physical file
        |--------------------------------------------------------------------------
        */

        if (!empty($resume['file_name'])) {

            $filePath =
                __DIR__ .
                "/../../uploads/resumes/" .
                basename($resume['file_name']);

            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Remove resume information from MongoDB
        |--------------------------------------------------------------------------
        */

        $candidates->updateOne(
            ["user_id" => $userId],
            [
                '$unset' => [
                    "resume_file" => ""
                ],
                '$set' => [
                    "updated_at" => new UTCDateTime()
                ]
            ]
        );

        echo json_encode([
            "success" => true,
            "message" => "Resume deleted successfully."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST - Upload resume
    |--------------------------------------------------------------------------
    */

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        if (empty($_POST['user_id'])) {
            echo json_encode([
                "success" => false,
                "message" => "user_id is required."
            ]);
            exit;
        }

        try {
            $userId = new ObjectId($_POST['user_id']);
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

        if (!isset($_FILES['resume'])) {
            echo json_encode([
                "success" => false,
                "message" => "Resume file is required."
            ]);
            exit;
        }

        $file = $_FILES['resume'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            echo json_encode([
                "success" => false,
                "message" => "Resume upload failed."
            ]);
            exit;
        }

        $maxSize = 5 * 1024 * 1024;

        if ($file['size'] > $maxSize) {
            echo json_encode([
                "success" => false,
                "message" => "Resume must be smaller than 5 MB."
            ]);
            exit;
        }

        $allowedExtensions = [
            "pdf",
            "doc",
            "docx"
        ];

        $extension = strtolower(
            pathinfo($file['name'], PATHINFO_EXTENSION)
        );

        if (!in_array($extension, $allowedExtensions)) {
            echo json_encode([
                "success" => false,
                "message" => "Only PDF, DOC and DOCX files are allowed."
            ]);
            exit;
        }

        /*
        |--------------------------------------------------------------------------
        | Delete previous uploaded resume
        |--------------------------------------------------------------------------
        */

        $oldResume = $candidate['resume_file'] ?? null;

        if ($oldResume && !empty($oldResume['file_name'])) {

            $oldFilePath =
                __DIR__ .
                "/../../uploads/resumes/" .
                basename($oldResume['file_name']);

            if (file_exists($oldFilePath)) {
                unlink($oldFilePath);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Save new file
        |--------------------------------------------------------------------------
        */

        $newFileName =
            "resume_" .
            $userId .
            "_" .
            time() .
            "." .
            $extension;

        $uploadDirectory =
            __DIR__ . "/../../uploads/resumes/";

        if (!is_dir($uploadDirectory)) {
            mkdir($uploadDirectory, 0777, true);
        }

        $filePath = $uploadDirectory . $newFileName;

        if (!move_uploaded_file(
            $file['tmp_name'],
            $filePath
        )) {
            echo json_encode([
                "success" => false,
                "message" => "Could not save resume."
            ]);
            exit;
        }

        $publicPath =
            "uploads/resumes/" . $newFileName;

        $resumeData = [
            "original_name" => $file['name'],
            "file_name" => $newFileName,
            "file_type" => $extension,
            "file_size" => $file['size'],
            "file_path" => $publicPath,
            "uploaded_at" => new UTCDateTime()
        ];

        $candidates->updateOne(
            ["user_id" => $userId],
            [
                '$set' => [
                    "resume_file" => $resumeData,
                    "updated_at" => new UTCDateTime()
                ]
            ]
        );

        echo json_encode([
            "success" => true,
            "message" => "Resume uploaded successfully.",
            "resume" => $resumeData
        ]);

        exit;
    }


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
