<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

try {

    $client = new Client("mongodb://localhost:27017");

    $database = $client->selectDatabase("hirehub");

    $notifications = $database->selectCollection("notifications");

    /*
     * GET NOTIFICATIONS
     */
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {

        $userId = $_GET['user_id'] ?? '';

        if (!$userId) {
            echo json_encode([
                "success" => false,
                "message" => "User ID is required."
            ]);
            exit;
        }

        try {
            $objectId = new ObjectId($userId);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid user ID."
            ]);
            exit;
        }

        $cursor = $notifications->find(
            [
                "user_id" => $objectId
            ],
            [
                "sort" => [
                    "created_at" => -1
                ],
                "limit" => 50
            ]
        );

        $result = [];

        foreach ($cursor as $notification) {

            $result[] = [
                "id" => (string) $notification["_id"],
                "title" => $notification["title"] ?? "",
                "message" => $notification["message"] ?? "",
                "type" => $notification["type"] ?? "general",
                "is_read" => $notification["is_read"] ?? false,
                "created_at" => isset($notification["created_at"])
                    ? $notification["created_at"]->toDateTime()->format("Y-m-d H:i:s")
                    : null
            ];
        }

        echo json_encode([
            "success" => true,
            "notifications" => $result
        ]);

        exit;
    }


    /*
     * MARK NOTIFICATION AS READ
     */
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $notificationId = $data['notification_id'] ?? '';

        if (!$notificationId) {
            echo json_encode([
                "success" => false,
                "message" => "Notification ID is required."
            ]);
            exit;
        }

        try {
            $objectId = new ObjectId($notificationId);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid notification ID."
            ]);
            exit;
        }

        $notifications->updateOne(
            [
                "_id" => $objectId
            ],
            [
                '$set' => [
                    "is_read" => true
                ]
            ]
        );

        echo json_encode([
            "success" => true,
            "message" => "Notification marked as read."
        ]);

        exit;
    }

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);
}

?>