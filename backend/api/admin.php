<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

try {

    $client = new Client(getenv("MONGODB_URI") ?: "mongodb://localhost:27017");

    $database = $client->selectDatabase("hirehub");

    $users = $database->selectCollection("users");
    $candidates = $database->selectCollection("candidates");
    $jobs = $database->selectCollection("jobs");
    $applications = $database->selectCollection("applications");
    $interviews = $database->selectCollection("interviews");
    $activityLogs = $database->selectCollection("activity_logs");

        /*
    |--------------------------------------------------------------------------
    | ACTIVITY LOG HELPER
    |--------------------------------------------------------------------------
    */

    function logActivity(
        $activityLogs,
        $action,
        $description,
        $userName = "",
        $userEmail = "",
        $role = ""
    ) {

        $activityLogs->insertOne([
            "action" => $action,
            "description" => $description,
            "user_name" => $userName,
            "user_email" => $userEmail,
            "role" => $role,
            "created_at" => new \MongoDB\BSON\UTCDateTime()
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | GET REQUEST DATA
    |--------------------------------------------------------------------------
    */

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($input)) {
            $input = [];
        }

        $action = $input['action'] ?? '';
        $adminIdString = $input['admin_id'] ?? '';

    } else {

        $action = $_GET['action'] ?? '';
        $adminIdString = $_GET['admin_id'] ?? '';

    }

        /*
    |--------------------------------------------------------------------------
    | LOG ACTIVITY
    |--------------------------------------------------------------------------
    */

    if (
        $method === 'POST' &&
        $action === 'log_activity'
    ) {

        $activityAction = $input['activity_action'] ?? '';
        $description = $input['description'] ?? '';
        $userName = $input['user_name'] ?? '';
        $userEmail = $input['user_email'] ?? '';
        $role = $input['role'] ?? '';

        if (empty($activityAction)) {

            echo json_encode([
                "success" => false,
                "message" => "Activity action is required."
            ]);

            exit;
        }

        $activityLogs->insertOne([
            "action" => $activityAction,
            "description" => $description,
            "user_name" => $userName,
            "user_email" => $userEmail,
            "role" => $role,
            "created_at" => new \MongoDB\BSON\UTCDateTime()
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Activity logged successfully."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN ID REQUIRED
    |--------------------------------------------------------------------------
    */

    if (empty($adminIdString)) {

        echo json_encode([
            "success" => false,
            "message" => "Admin ID is required."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE ADMIN ID
    |--------------------------------------------------------------------------
    */

    try {

        $adminId = new ObjectId($adminIdString);

    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid admin ID."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | FIND ADMIN
    |--------------------------------------------------------------------------
    */

    $admin = $users->findOne([
        "_id" => $adminId
    ]);


    if (!$admin) {

        echo json_encode([
            "success" => false,
            "message" => "Admin account not found."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | VERIFY ADMIN ROLE
    |--------------------------------------------------------------------------
    */

    if (($admin['role'] ?? '') !== 'admin') {

        echo json_encode([
            "success" => false,
            "message" => "Access denied. Admin privileges required."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | VERIFY ADMIN STATUS
    |--------------------------------------------------------------------------
    */

    if (($admin['status'] ?? '') !== 'active') {

        echo json_encode([
            "success" => false,
            "message" => "Admin account is not active."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | USER MANAGEMENT - GET USERS
    |--------------------------------------------------------------------------
    */

    if (
        $method === 'GET' &&
        $action === 'users'
    ) {

        $userList = $users->find(
            [],
            [
                "sort" => [
                    "created_at" => -1
                ]
            ]
        );

        $result = [];

        foreach ($userList as $user) {

            $result[] = [
                "_id" => (string) $user['_id'],
                "name" => $user['name'] ?? "",
                "email" => $user['email'] ?? "",
                "role" => $user['role'] ?? "",
                "phone" => $user['phone'] ?? "",
                "status" => $user['status'] ?? "inactive",
                "created_at" => isset($user['created_at'])
                    ? $user['created_at']->toDateTime()->format('c')
                    : null
            ];
        }

        echo json_encode([
            "success" => true,
            "message" => "Users retrieved successfully.",
            "count" => count($result),
            "users" => $result
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | USER MANAGEMENT - UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    if (
        $method === 'POST' &&
        $action === 'update_status'
    ) {

        $userIdString = $input['user_id'] ?? '';
        $newStatus = $input['status'] ?? '';


        /*
        |----------------------------------------------------------------------
        | VALIDATE USER ID
        |----------------------------------------------------------------------
        */

        if (empty($userIdString)) {

            echo json_encode([
                "success" => false,
                "message" => "User ID is required."
            ]);

            exit;
        }


        try {

            $userId = new ObjectId($userIdString);

        } catch (Exception $e) {

            echo json_encode([
                "success" => false,
                "message" => "Invalid user ID."
            ]);

            exit;
        }


        /*
        |----------------------------------------------------------------------
        | VALIDATE STATUS
        |----------------------------------------------------------------------
        */

        if (!in_array($newStatus, ["active", "inactive"])) {

            echo json_encode([
                "success" => false,
                "message" => "Invalid status."
            ]);

            exit;
        }


        /*
        |----------------------------------------------------------------------
        | PROTECT CURRENT ADMIN
        |----------------------------------------------------------------------
        */

        if ($userIdString === $adminIdString) {

            echo json_encode([
                "success" => false,
                "message" => "You cannot change your own admin account status."
            ]);

            exit;
        }


        /*
        |----------------------------------------------------------------------
        | FIND TARGET USER
        |----------------------------------------------------------------------
        */

        $targetUser = $users->findOne([
            "_id" => $userId
        ]);


        if (!$targetUser) {

            echo json_encode([
                "success" => false,
                "message" => "User not found."
            ]);

            exit;
        }


        /*
        |----------------------------------------------------------------------
        | UPDATE USER
        |----------------------------------------------------------------------
        */

        $updateResult = $users->updateOne(
            [
                "_id" => $userId
            ],
            [
                '$set' => [
                    "status" => $newStatus
                ]
            ]
        );


        if ($updateResult->getModifiedCount() === 0) {

            echo json_encode([
                "success" => true,
                "message" => "User status is already set to " . $newStatus . ".",
                "status" => $newStatus
            ]);

            exit;
        }


        echo json_encode([
            "success" => true,
            "message" => "User status updated successfully.",
            "user_id" => $userIdString,
            "status" => $newStatus
        ]);

        exit;
    }
/*
|--------------------------------------------------------------------------
| ADMIN ACTIVITY LOGS
|--------------------------------------------------------------------------
*/

if (
    isset($_GET['action']) &&
    $_GET['action'] === 'activity'
) {

    $activityList = $activityLogs->find(
        [],
        [
            "sort" => [
                "created_at" => -1
            ],
            "limit" => 100
        ]
    );

    $result = [];

    foreach ($activityList as $log) {

        $createdAt = null;

        if (isset($log['created_at'])) {

            if ($log['created_at'] instanceof \MongoDB\BSON\UTCDateTime) {

                $createdAt = $log['created_at']
                    ->toDateTime()
                    ->format('c');

            } elseif (
                $log['created_at'] instanceof \MongoDB\Model\BSONDocument
            ) {

                $createdAt = null;

            } else {

                $createdAt = (string) $log['created_at'];
            }
        }

        $result[] = [
            "_id" => (string) $log['_id'],
            "action" => $log['action'] ?? "",
            "description" => $log['description'] ?? "",
            "user_name" => $log['user_name'] ?? "",
            "user_email" => $log['user_email'] ?? "",
            "role" => $log['role'] ?? "",
            "created_at" => $createdAt
        ];
    }

    echo json_encode([
        "success" => true,
        "message" => "Activity logs retrieved successfully.",
        "count" => count($result),
        "logs" => $result
    ]);

    exit;
}
    /*
    |--------------------------------------------------------------------------
    | DASHBOARD STATISTICS
    |--------------------------------------------------------------------------
    */

    $totalUsers =
        $users->countDocuments();

    $totalCandidates =
        $users->countDocuments([
            "role" => "candidate"
        ]);

    $totalEmployers =
        $users->countDocuments([
            "role" => "employer"
        ]);

    $totalAdmins =
        $users->countDocuments([
            "role" => "admin"
        ]);

    $activeUsers =
        $users->countDocuments([
            "status" => "active"
        ]);

    $inactiveUsers =
        $users->countDocuments([
            "status" => [
                '$ne' => "active"
            ]
        ]);

    $totalCandidateProfiles =
        $candidates->countDocuments();

    $totalJobs =
        $jobs->countDocuments();

    $activeJobs =
        $jobs->countDocuments([
            "status" => "active"
        ]);

    $totalApplications =
        $applications->countDocuments();

    $totalInterviews =
        $interviews->countDocuments();


    /*
    |--------------------------------------------------------------------------
    | APPLICATION STATUS
    |--------------------------------------------------------------------------
    */

    $pendingApplications =
        $applications->countDocuments([
            "status" => "pending"
        ]);

    $acceptedApplications =
        $applications->countDocuments([
            "status" => "accepted"
        ]);

    $rejectedApplications =
        $applications->countDocuments([
            "status" => "rejected"
        ]);


    /*
    |--------------------------------------------------------------------------
    | INTERVIEW STATUS
    |--------------------------------------------------------------------------
    */

    $scheduledInterviews =
        $interviews->countDocuments([
            "status" => "scheduled"
        ]);

    $completedInterviews =
        $interviews->countDocuments([
            "status" => "completed"
        ]);

    $cancelledInterviews =
        $interviews->countDocuments([
            "status" => "cancelled"
        ]);


    /*
    |--------------------------------------------------------------------------
    | DASHBOARD RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([

        "success" => true,

        "message" =>
            "Admin dashboard data retrieved successfully.",

        "admin" => [
            "id" => (string) $admin['_id'],
            "name" => $admin['name'] ?? "",
            "email" => $admin['email'] ?? "",
            "role" => $admin['role'] ?? ""
        ],

        "statistics" => [

            "users" => [
                "total" => $totalUsers,
                "candidates" => $totalCandidates,
                "employers" => $totalEmployers,
                "admins" => $totalAdmins,
                "active" => $activeUsers,
                "inactive" => $inactiveUsers
            ],

            "candidates" => [
                "total_profiles" => $totalCandidateProfiles
            ],

            "jobs" => [
                "total" => $totalJobs,
                "active" => $activeJobs
            ],

            "applications" => [
                "total" => $totalApplications,
                "pending" => $pendingApplications,
                "accepted" => $acceptedApplications,
                "rejected" => $rejectedApplications
            ],

            "interviews" => [
                "total" => $totalInterviews,
                "scheduled" => $scheduledInterviews,
                "completed" => $completedInterviews,
                "cancelled" => $cancelledInterviews
            ]

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