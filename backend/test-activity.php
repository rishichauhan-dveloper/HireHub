<?php
require_once "C:/xampp/htdocs/HireHub/backend/vendor/autoload.php";

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

$client = new Client("mongodb://localhost:27017");
$db = $client->selectDatabase("hirehub");
$logs = $db->selectCollection("activity_logs");

$logs->insertOne([
    "action" => "system_test",
    "description" => "Activity logging system test.",
    "user_name" => "HireHub Admin",
    "user_email" => "admin@hirehub.com",
    "role" => "admin",
    "created_at" => new UTCDateTime()
]);

echo "Activity log test inserted successfully.";
?>
