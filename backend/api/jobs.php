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
    $jobs = $database->selectCollection("jobs");

    $method = $_SERVER['REQUEST_METHOD'];

/*
|--------------------------------------------------------------------------
| GET - View Jobs
|--------------------------------------------------------------------------
*/

if ($method === 'GET') {
    // View single job
if (!empty($_GET['id'])) {

    try {
        $jobId = new ObjectId($_GET['id']);
    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid job ID."
        ]);

        exit;
    }

    $job = $jobs->findOne([
        "_id" => $jobId,
        "status" => "active"
    ]);

    if (!$job) {

        echo json_encode([
            "success" => false,
            "message" => "Job not found."
        ]);

        exit;
    }

    $job['_id'] = (string) $job['_id'];
    $job['employer_id'] = (string) $job['employer_id'];

    echo json_encode([
        "success" => true,
        "message" => "Job retrieved successfully.",
        "job" => $job
    ]);

    exit;
}

    // Search parameters
    $search = trim($_GET['search'] ?? "");
    $location = trim($_GET['location'] ?? "");
    $jobType = trim($_GET['job_type'] ?? "");
    $employerId = trim($_GET['employer_id'] ?? "");

    // Base filter
    $filter = [
        "status" => "active"
    ];
    if ($employerId !== "") {

    try {

        $filter['employer_id'] = new ObjectId($employerId);

    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid employer ID."
        ]);

        exit;
    }
}

    // Search by title, company or skills
    if ($search !== "") {

        $filter['$or'] = [

            [
                "title" => [
                    '$regex' => $search,
                    '$options' => 'i'
                ]
            ],

            [
                "company_name" => [
                    '$regex' => $search,
                    '$options' => 'i'
                ]
            ],

            [
                "skills" => [
                    '$regex' => $search,
                    '$options' => 'i'
                ]
            ]
        ];
    }

    // Location filter
    if ($location !== "") {

        $filter['location'] = [
            '$regex' => $location,
            '$options' => 'i'
        ];
    }

    // Job type filter
    if ($jobType !== "") {

        $filter['job_type'] = [
            '$regex' => $jobType,
            '$options' => 'i'
        ];
    }

    // Get jobs
    $jobsList = $jobs->find(
        $filter,
        [
            "sort" => [
                "created_at" => -1
            ]
        ]
    );

    $result = [];

    foreach ($jobsList as $job) {

        $job['_id'] =
            (string) $job['_id'];

        $job['employer_id'] =
            (string) $job['employer_id'];

        $result[] = $job;
    }

    echo json_encode([

        "success" => true,

        "message" =>
            "Jobs retrieved successfully.",

        "count" =>
            count($result),

        "jobs" =>
            $result
    ]);

    exit;
}


 /*
    |--------------------------------------------------------------------------
    | POST - Create Job
    |--------------------------------------------------------------------------
    */

    if ($method === 'POST') {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        // Required fields
        if (
            empty($data['employer_id']) ||
            empty($data['company_name']) ||
            empty($data['title']) ||
            empty($data['description'])
        ) {

            echo json_encode([
                "success" => false,
                "message" => "Employer, company, title and description are required."
            ]);

            exit;
        }

        // Validate employer ID
try {

    $employerId =
        new ObjectId($data['employer_id']);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid employer ID."
    ]);

    exit;
}

// Verify employer account
$users = $database->selectCollection("users");

$employer = $users->findOne([
    "_id" => $employerId,
    "role" => "employer",
    "status" => "active"
]);

if (!$employer) {

    echo json_encode([
        "success" => false,
        "message" => "Access denied. Active employer account required."
    ]);

    exit;
}
        // Prepare job
        $job = [

            "employer_id" => $employerId,

            "company_name" =>
                trim($data['company_name']),

            "title" =>
                trim($data['title']),

            "description" =>
                trim($data['description']),

            "skills" =>
                $data['skills'] ?? [],

            "qualification" =>
                trim($data['qualification'] ?? ""),

            "experience" =>
                trim($data['experience'] ?? ""),

            "salary" =>
                trim($data['salary'] ?? ""),

            "location" =>
                trim($data['location'] ?? ""),

            "job_type" =>
                trim($data['job_type'] ?? "Full Time"),

            "status" =>
                "active",

            "created_at" =>
                new UTCDateTime(),

            "updated_at" =>
                new UTCDateTime()
        ];

        // Insert job
        $result = $jobs->insertOne($job);

        echo json_encode([

            "success" => true,

            "message" =>
                "Job created successfully.",

            "job_id" =>
                (string) $result->getInsertedId()

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Unsupported Method
    |--------------------------------------------------------------------------
    */
    /*
|--------------------------------------------------------------------------
| DELETE - Delete Job
|--------------------------------------------------------------------------
*/

if ($method === 'DELETE') {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (empty($data['job_id'])) {

        echo json_encode([
            "success" => false,
            "message" => "job_id is required."
        ]);

        exit;
    }

    try {

        $jobId =
            new ObjectId($data['job_id']);

    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid job ID."
        ]);

        exit;
    }

    $existingJob = $jobs->findOne([
    "_id" => $jobId
]);

if (!$existingJob) {

    echo json_encode([
        "success" => false,
        "message" => "Job not found."
    ]);

    exit;
}

$users = $database->selectCollection("users");

$employer = $users->findOne([
    "_id" => $existingJob['employer_id'],
    "role" => "employer",
    "status" => "active"
]);

if (!$employer) {

    echo json_encode([
        "success" => false,
        "message" => "Access denied. Employer account required."
    ]);

    exit;
}

$result = $jobs->deleteOne([
    "_id" => $jobId
]);

    if ($result->getDeletedCount() === 0) {

        echo json_encode([
            "success" => false,
            "message" => "Job not found."
        ]);

        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Job deleted successfully."
    ]);

    exit;
}
    /*
|--------------------------------------------------------------------------
| PUT - Update Job
|--------------------------------------------------------------------------
*/

if ($method === 'PUT') {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (empty($data['job_id'])) {

        echo json_encode([
            "success" => false,
            "message" => "job_id is required."
        ]);

        exit;
    }

    try {

        $jobId =
            new ObjectId($data['job_id']);

    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid job ID."
        ]);

        exit;
    }

    $existingJob = $jobs->findOne([
        "_id" => $jobId
    ]);

    if (!$existingJob) {

        echo json_encode([
            "success" => false,
            "message" => "Job not found."
        ]);

        exit;
    }

    $users = $database->selectCollection("users");

$employer = $users->findOne([
    "_id" => $existingJob['employer_id'],
    "role" => "employer",
    "status" => "active"
]);

if (!$employer) {

    echo json_encode([
        "success" => false,
        "message" => "Access denied. Employer account required."
    ]);

    exit;
}

    $updateData = [];

    if (isset($data['company_name'])) {
        $updateData['company_name'] =
            trim($data['company_name']);
    }

    if (isset($data['title'])) {
        $updateData['title'] =
            trim($data['title']);
    }

    if (isset($data['description'])) {
        $updateData['description'] =
            trim($data['description']);
    }

    if (isset($data['skills'])) {
        $updateData['skills'] =
            $data['skills'];
    }

    if (isset($data['qualification'])) {
        $updateData['qualification'] =
            trim($data['qualification']);
    }

    if (isset($data['experience'])) {
        $updateData['experience'] =
            trim($data['experience']);
    }

    if (isset($data['salary'])) {
        $updateData['salary'] =
            trim($data['salary']);
    }

    if (isset($data['location'])) {
        $updateData['location'] =
            trim($data['location']);
    }

    if (isset($data['job_type'])) {
        $updateData['job_type'] =
            trim($data['job_type']);
    }

    if (isset($data['status'])) {
        $updateData['status'] =
            trim($data['status']);
    }

    if (empty($updateData)) {

        echo json_encode([
            "success" => false,
            "message" => "No fields provided for update."
        ]);

        exit;
    }

    $updateData['updated_at'] =
        new UTCDateTime();

    $result = $jobs->updateOne(
        [
            "_id" => $jobId
        ],
        [
            '$set' => $updateData
        ]
    );

    echo json_encode([
        "success" => true,
        "message" => "Job updated successfully.",
        "modified_count" =>
            $result->getModifiedCount()
    ]);

    exit;
}

    echo json_encode([

        "success" => false,

        "message" =>
            "Unsupported request method."

    ]);

    exit;


} catch (Exception $e) {

    echo json_encode([

        "success" => false,

        "message" =>
            "Server error.",

        "error" =>
            $e->getMessage()

    ]);

    exit;
}

?>