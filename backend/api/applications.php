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

    $applications = $database->selectCollection("applications");
    $jobs = $database->selectCollection("jobs");
    $candidates = $database->selectCollection("candidates");

    $method = $_SERVER['REQUEST_METHOD'];


    /*
    |--------------------------------------------------------------------------
    | GET - View Applications
    |--------------------------------------------------------------------------
    */

    if ($method === 'GET') {
                /*
        |--------------------------------------------------------------------------
        | Admin - All Applications
        |--------------------------------------------------------------------------
        */

        if (!empty($_GET['admin_id'])) {

            try {

                $adminId =
                    new ObjectId($_GET['admin_id']);

            } catch (Exception $e) {

                echo json_encode([
                    "success" => false,
                    "message" => "Invalid admin ID."
                ]);

                exit;
            }

            $applicationList = $applications->find(
                [],
                [
                    "sort" => [
                        "applied_at" => -1
                    ]
                ]
            );

            $result = [];

            foreach ($applicationList as $application) {

                $application['_id'] =
                    (string) $application['_id'];

                if (isset($application['job_id'])) {
                    $application['job_id'] =
                        (string) $application['job_id'];
                }

                if (isset($application['candidate_id'])) {
                    $application['candidate_id'] =
                        (string) $application['candidate_id'];
                }

                if (isset($application['employer_id'])) {
                    $application['employer_id'] =
                        (string) $application['employer_id'];
                }

                $result[] = $application;
            }

            echo json_encode([
                "success" => true,
                "message" =>
                    "All applications retrieved successfully.",
                "count" =>
                    count($result),
                "applications" =>
                    $result
            ]);

            exit;
        }

        /*
        |--------------------------------------------------------------------------
        | Candidate Applications
        |--------------------------------------------------------------------------
        */

        if (!empty($_GET['candidate_id'])) {
            

            try {

                $candidateId =
                    new ObjectId($_GET['candidate_id']);

            } catch (Exception $e) {

                echo json_encode([
                    "success" => false,
                    "message" => "Invalid candidate ID."
                ]);

                exit;
            }

            $applicationList = $applications->find(
                [
                    "candidate_id" => $candidateId
                ],
                [
                    "sort" => [
                        "applied_at" => -1
                    ]
                ]
            );

            $result = [];

            foreach ($applicationList as $application) {

                $application['_id'] =
                    (string) $application['_id'];

                $application['job_id'] =
                    (string) $application['job_id'];

                $application['candidate_id'] =
                    (string) $application['candidate_id'];

                $application['employer_id'] =
                    (string) $application['employer_id'];

                $result[] = $application;
            }

            echo json_encode([
                "success" => true,
                "message" =>
                    "Applications retrieved successfully.",
                "count" =>
                    count($result),
                "applications" =>
                    $result
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Employer Applications
        |--------------------------------------------------------------------------
        */

        if (!empty($_GET['employer_id'])) {

            try {

                $employerId =
                    new ObjectId($_GET['employer_id']);

            } catch (Exception $e) {

                echo json_encode([
                    "success" => false,
                    "message" => "Invalid employer ID."
                ]);

                exit;
            }

            $applicationList = $applications->find(
                [
                    "employer_id" => $employerId
                ],
                [
                    "sort" => [
                        "applied_at" => -1
                    ]
                ]
            );

            $result = [];

            foreach ($applicationList as $application) {

                $application['_id'] =
                    (string) $application['_id'];

                $application['job_id'] =
                    (string) $application['job_id'];

                $application['candidate_id'] =
                    (string) $application['candidate_id'];

                $application['employer_id'] =
                    (string) $application['employer_id'];

                $result[] = $application;
            }

            echo json_encode([
                "success" => true,
                "message" =>
                    "Employer applications retrieved successfully.",
                "count" =>
                    count($result),
                "applications" =>
                    $result
            ]);

            exit;
        }


        /*
|--------------------------------------------------------------------------
| Admin - View All Applications
|--------------------------------------------------------------------------
*/

if (!empty($_GET['admin_id'])) {

    try {

        $adminId =
            new ObjectId($_GET['admin_id']);

    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid admin ID."
        ]);

        exit;
    }

    $applicationList = $applications->find(
        [],
        [
            "sort" => [
                "applied_at" => -1
            ]
        ]
    );

    $result = [];

    foreach ($applicationList as $application) {

        $application['_id'] =
            (string) $application['_id'];

        $application['job_id'] =
            (string) $application['job_id'];

        $application['candidate_id'] =
            (string) $application['candidate_id'];

        $application['employer_id'] =
            (string) $application['employer_id'];

        $result[] = $application;
    }

    echo json_encode([
        "success" => true,
        "message" =>
            "All applications retrieved successfully.",
        "count" =>
            count($result),
        "applications" =>
            $result
    ]);

    exit;
}
/*
|--------------------------------------------------------------------------
| Admin Applications
|--------------------------------------------------------------------------
*/

if (!empty($_GET['admin_id'])) {

    try {

        $adminId =
            new ObjectId($_GET['admin_id']);

    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid admin ID."
        ]);

        exit;
    }

    $applicationList = $applications->find(
        [],
        [
            "sort" => [
                "applied_at" => -1
            ]
        ]
    );

    $result = [];

    foreach ($applicationList as $application) {

        $application['_id'] =
            (string) $application['_id'];

        if (isset($application['job_id'])) {
            $application['job_id'] =
                (string) $application['job_id'];
        }

        if (isset($application['candidate_id'])) {
            $application['candidate_id'] =
                (string) $application['candidate_id'];
        }

        if (isset($application['employer_id'])) {
            $application['employer_id'] =
                (string) $application['employer_id'];
        }

        $result[] = $application;
    }

    echo json_encode([
        "success" => true,
        "message" =>
            "Admin applications retrieved successfully.",
        "count" =>
            count($result),
        "applications" =>
            $result
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| No ID Provided
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => false,
    "message" =>
        "candidate_id, employer_id or admin_id is required."
]);

exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST - Apply For Job
    |--------------------------------------------------------------------------
    */

    if ($method === 'POST') {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (
            empty($data['job_id']) ||
            empty($data['candidate_id'])
        ) {

            echo json_encode([
                "success" => false,
                "message" =>
                    "job_id and candidate_id are required."
            ]);

            exit;
        }


        // Validate Job ID

        try {

            $jobId =
                new ObjectId($data['job_id']);

        } catch (Exception $e) {

            echo json_encode([
                "success" => false,
                "message" =>
                    "Invalid job ID."
            ]);

            exit;
        }


        // Validate Candidate ID

        try {

            $candidateId =
                new ObjectId($data['candidate_id']);

        } catch (Exception $e) {

            echo json_encode([
                "success" => false,
                "message" =>
                    "Invalid candidate ID."
            ]);

            exit;
        }


        // Check Job

        $job = $jobs->findOne([
            "_id" => $jobId,
            "status" => "active"
        ]);

        if (!$job) {

            echo json_encode([
                "success" => false,
                "message" =>
                    "Job not found or inactive."
            ]);

            exit;
        }


        // Check Candidate

        $candidate = $candidates->findOne([
            "user_id" => $candidateId
        ]);

        if (!$candidate) {

            echo json_encode([
                "success" => false,
                "message" =>
                    "Candidate profile not found."
            ]);

            exit;
        }


        // Check Duplicate Application

        $existingApplication =
            $applications->findOne([
                "job_id" => $jobId,
                "candidate_id" => $candidateId
            ]);

        if ($existingApplication) {

            echo json_encode([
                "success" => false,
                "message" =>
                    "You have already applied for this job."
            ]);

            exit;
        }


        // Create Application

        $application = [

            "job_id" =>
                $jobId,

            "candidate_id" =>
                $candidateId,

            "employer_id" =>
                $job['employer_id'],

            "candidate_name" =>
                $candidate['full_name'],

            "candidate_email" =>
                $candidate['email'],

            "job_title" =>
                $job['title'],

            "company_name" =>
                $job['company_name'],

            "cover_letter" =>
                trim(
                    $data['cover_letter'] ?? ""
                ),

            "status" =>
                "Applied",

            "applied_at" =>
                new UTCDateTime(),

            "updated_at" =>
                new UTCDateTime()
        ];


        // Insert Application

        $result =
            $applications->insertOne(
                $application
            );


        echo json_encode([

            "success" => true,

            "message" =>
                "Job application submitted successfully.",

            "application_id" =>
                (string)
                $result->getInsertedId()

        ]);

        exit;
    }
/*
|--------------------------------------------------------------------------
| PUT - Update Application Status
|--------------------------------------------------------------------------
*/

if ($method === 'PUT') {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (
        empty($data['application_id']) ||
        empty($data['status'])
    ) {

        echo json_encode([
            "success" => false,
            "message" =>
                "application_id and status are required."
        ]);

        exit;
    }

    try {

        $applicationId =
            new ObjectId($data['application_id']);

    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "message" =>
                "Invalid application ID."
        ]);

        exit;
    }

    // Allowed statuses
    $allowedStatuses = [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Interview",
        "Selected",
        "Rejected"
    ];

    $status = trim($data['status']);

    if (!in_array($status, $allowedStatuses)) {

        echo json_encode([
            "success" => false,
            "message" =>
                "Invalid application status."
        ]);

        exit;
    }

    // Check application exists
    $application =
        $applications->findOne([
            "_id" => $applicationId
        ]);

    if (!$application) {

        echo json_encode([
            "success" => false,
            "message" =>
                "Application not found."
        ]);

        exit;
    }

    // Update status
    $result = $applications->updateOne(
        [
            "_id" => $applicationId
        ],
        [
            '$set' => [
                "status" => $status,
                "updated_at" => new UTCDateTime()
            ]
        ]
    );
    // Create candidate notification

$notifications = $database->selectCollection("notifications");

$notifications->insertOne([
    "user_id" => $application['candidate_id'],
    "title" => "Application Status Updated",
    "message" => "Your application for " . $application['job_title'] . " is now " . $status . ".",
    "type" => "application",
    "is_read" => false,
    "created_at" => new UTCDateTime()
]);

    echo json_encode([
        "success" => true,
        "message" =>
            "Application status updated successfully.",
        "status" => $status,
        "modified_count" =>
            $result->getModifiedCount()
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