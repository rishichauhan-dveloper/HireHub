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

    /*
    |--------------------------------------------------------------------------
    | MongoDB Connection
    |--------------------------------------------------------------------------
    */

    $client = new Client("mongodb://localhost:27017");

    $database = $client->selectDatabase("hirehub");

    $interviews = $database->selectCollection("interviews");
    $applications = $database->selectCollection("applications");
    $jobs = $database->selectCollection("jobs");


    $method = $_SERVER['REQUEST_METHOD'];


    /*
    |--------------------------------------------------------------------------
    | GET - View Interviews
    |--------------------------------------------------------------------------
    */

    if ($method === 'GET') {

        $filter = [];

        /*
        | Candidate filter
        */

        if (!empty($_GET['candidate_id'])) {

            try {
                $filter['candidate_id'] =
                    new ObjectId($_GET['candidate_id']);
            } catch (Exception $e) {

                echo json_encode([
                    "success" => false,
                    "message" => "Invalid candidate ID."
                ]);

                exit;
            }
        }


        /*
        | Employer filter
        */

        if (!empty($_GET['employer_id'])) {

            try {
                $filter['employer_id'] =
                    new ObjectId($_GET['employer_id']);
            } catch (Exception $e) {

                echo json_encode([
                    "success" => false,
                    "message" => "Invalid employer ID."
                ]);

                exit;
            }
        }


        /*
        | Application filter
        */

        if (!empty($_GET['application_id'])) {

            try {
                $filter['application_id'] =
                    new ObjectId($_GET['application_id']);
            } catch (Exception $e) {

                echo json_encode([
                    "success" => false,
                    "message" => "Invalid application ID."
                ]);

                exit;
            }
        }


        $cursor = $interviews->find(
            $filter,
            [
                "sort" => [
                    "interview_date" => 1,
                    "interview_time" => 1
                ]
            ]
        );


        $interviewList = [];


        foreach ($cursor as $interview) {

            $interview['_id'] =
                (string) $interview['_id'];

            if (isset($interview['candidate_id'])) {
                $interview['candidate_id'] =
                    (string) $interview['candidate_id'];
            }

            if (isset($interview['employer_id'])) {
                $interview['employer_id'] =
                    (string) $interview['employer_id'];
            }

            if (isset($interview['application_id'])) {
                $interview['application_id'] =
                    (string) $interview['application_id'];
            }

            if (isset($interview['job_id'])) {
                $interview['job_id'] =
                    (string) $interview['job_id'];
            }

            $interviewList[] = $interview;
        }


        echo json_encode([
            "success" => true,
            "message" => "Interviews retrieved successfully.",
            "count" => count($interviewList),
            "interviews" => $interviewList
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST - Schedule Interview
    |--------------------------------------------------------------------------
    */

    if ($method === 'POST') {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );


        if (
            empty($data['application_id']) ||
            empty($data['candidate_id']) ||
            empty($data['employer_id']) ||
            empty($data['job_id']) ||
            empty($data['interview_date']) ||
            empty($data['interview_time'])
        ) {

            echo json_encode([
                "success" => false,
                "message" =>
                    "application_id, candidate_id, employer_id, job_id, interview_date and interview_time are required."
            ]);

            exit;
        }


        try {

            $applicationId =
                new ObjectId($data['application_id']);

            $candidateId =
                new ObjectId($data['candidate_id']);

            $employerId =
                new ObjectId($data['employer_id']);

            $jobId =
                new ObjectId($data['job_id']);

        } catch (Exception $e) {

            echo json_encode([
                "success" => false,
                "message" => "Invalid ID provided."
            ]);

            exit;
        }


        /*
        | Verify application exists
        */

        $application = $applications->findOne([
            "_id" => $applicationId
        ]);

        if (!$application) {

            echo json_encode([
                "success" => false,
                "message" => "Application not found."
            ]);

            exit;
        }


        /*
        | Verify job exists
        */

        $job = $jobs->findOne([
            "_id" => $jobId
        ]);

        if (!$job) {

            echo json_encode([
                "success" => false,
                "message" => "Job not found."
            ]);

            exit;
        }


        /*
        | Prevent duplicate scheduled interview
        */

        $existingInterview =
            $interviews->findOne([
                "application_id" => $applicationId,
                "status" => [
                    '$nin' => [
                        "cancelled",
                        "completed"
                    ]
                ]
            ]);


        if ($existingInterview) {

            echo json_encode([
                "success" => false,
                "message" =>
                    "An active interview already exists for this application."
            ]);

            exit;
        }


        /*
        | Create Interview
        */

        $interview = [

            "application_id" =>
                $applicationId,

            "candidate_id" =>
                $candidateId,

            "employer_id" =>
                $employerId,

            "job_id" =>
                $jobId,

            "interview_date" =>
                trim($data['interview_date']),

            "interview_time" =>
                trim($data['interview_time']),

            "interview_type" =>
                trim($data['interview_type'] ?? "Online"),

            "meeting_link" =>
                trim($data['meeting_link'] ?? ""),

            "location" =>
                trim($data['location'] ?? ""),

            "notes" =>
                trim($data['notes'] ?? ""),

            "status" =>
                "scheduled",

            "feedback" =>
                "",

            "rating" =>
                null,

            "created_at" =>
                new UTCDateTime(),

            "updated_at" =>
                new UTCDateTime()
        ];


        $result =
            $interviews->insertOne($interview);
            // Create candidate notification

$notifications = $database->selectCollection("notifications");

$notifications->insertOne([
    "user_id" => $candidateId,
    "title" => "Interview Scheduled",
    "message" =>
        "Your interview has been scheduled for " .
        $interview["interview_date"] .
        " at " .
        $interview["interview_time"] . ".",
    "type" => "interview",
    "is_read" => false,
    "created_at" => new UTCDateTime()
]);


        echo json_encode([
            "success" => true,
            "message" =>
                "Interview scheduled successfully.",
            "interview_id" =>
                (string) $result->getInsertedId()
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | PUT - Update Interview
    |--------------------------------------------------------------------------
    */

    if ($method === 'PUT') {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );


        if (empty($data['interview_id'])) {

            echo json_encode([
                "success" => false,
                "message" => "interview_id is required."
            ]);

            exit;
        }


        try {

            $interviewId =
                new ObjectId($data['interview_id']);

        } catch (Exception $e) {
            $existingInterview =
    $interviews->findOne([
        "_id" => $interviewId
    ]);

if (!$existingInterview) {

    echo json_encode([
        "success" => false,
        "message" => "Interview not found."
    ]);

    exit;
}

            echo json_encode([
                "success" => false,
                "message" => "Invalid interview ID."
            ]);

            exit;
        }


        $existingInterview =
            $interviews->findOne([
                "_id" => $interviewId
            ]);


        if (!$existingInterview) {

            echo json_encode([
                "success" => false,
                "message" => "Interview not found."
            ]);

            exit;
        }


        $updateData = [];


        if (isset($data['interview_date'])) {
            $updateData['interview_date'] =
                trim($data['interview_date']);
        }


        if (isset($data['interview_time'])) {
            $updateData['interview_time'] =
                trim($data['interview_time']);
        }


        if (isset($data['interview_type'])) {
            $updateData['interview_type'] =
                trim($data['interview_type']);
        }


        if (isset($data['meeting_link'])) {
            $updateData['meeting_link'] =
                trim($data['meeting_link']);
        }


        if (isset($data['location'])) {
            $updateData['location'] =
                trim($data['location']);
        }


        if (isset($data['notes'])) {
            $updateData['notes'] =
                trim($data['notes']);
        }


        if (isset($data['status'])) {
            $updateData['status'] =
                trim($data['status']);
        }


        if (isset($data['feedback'])) {
            $updateData['feedback'] =
                trim($data['feedback']);
        }


        if (isset($data['rating'])) {

            $updateData['rating'] =
                $data['rating'];
        }


        if (empty($updateData)) {

            echo json_encode([
                "success" => false,
                "message" =>
                    "No fields provided for update."
            ]);

            exit;
        }


        $updateData['updated_at'] =
            new UTCDateTime();


        $result =
            $interviews->updateOne(
                [
                    "_id" => $interviewId
                ],
                [
                    '$set' => $updateData
                ]
            );
            // Create candidate notification

$notifications = $database->selectCollection("notifications");

$notifications->insertOne([
    "user_id" => $existingInterview["candidate_id"],
    "title" => "Interview Updated",
    "message" =>
        "Your interview has been updated. " .
        "Date: " . ($updateData["interview_date"] ?? $existingInterview["interview_date"]) .
        ", Time: " . ($updateData["interview_time"] ?? $existingInterview["interview_time"]) . ".",
    "type" => "interview",
    "is_read" => false,
    "created_at" => new UTCDateTime()
]);


        echo json_encode([
            "success" => true,
            "message" =>
                "Interview updated successfully.",
            "modified_count" =>
                $result->getModifiedCount()
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE - Cancel/Delete Interview
    |--------------------------------------------------------------------------
    */

    if ($method === 'DELETE') {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );


        if (empty($data['interview_id'])) {

            echo json_encode([
                "success" => false,
                "message" => "interview_id is required."
            ]);

            exit;
        }


        try {

            $interviewId =
                new ObjectId($data['interview_id']);

        } catch (Exception $e) {

            echo json_encode([
                "success" => false,
                "message" => "Invalid interview ID."
            ]);

            exit;
        }

        $existingInterview =
    $interviews->findOne([
        "_id" => $interviewId
    ]);

if (!$existingInterview) {

    echo json_encode([
        "success" => false,
        "message" => "Interview not found."
    ]);

    exit;
}

        $result =
            $interviews->updateOne(
                [
                    "_id" => $interviewId
                ],
                [
                    '$set' => [
                        "status" => "cancelled",
                        "updated_at" =>
                            new UTCDateTime()
                    ]
                ]
            );
            // Create candidate notification

$notifications = $database->selectCollection("notifications");

$notifications->insertOne([
    "user_id" => $existingInterview["candidate_id"],
    "title" => "Interview Cancelled",
    "message" =>
        "Your interview scheduled for " .
        $existingInterview["interview_date"] .
        " at " .
        $existingInterview["interview_time"] .
        " has been cancelled.",
    "type" => "interview",
    "is_read" => false,
    "created_at" => new UTCDateTime()
]);


        if ($result->getMatchedCount() === 0) {

            echo json_encode([
                "success" => false,
                "message" => "Interview not found."
            ]);

            exit;
        }


        echo json_encode([
            "success" => true,
            "message" =>
                "Interview cancelled successfully."
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

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);

    exit;
}

?>