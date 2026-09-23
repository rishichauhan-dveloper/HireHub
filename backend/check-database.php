<?php

require_once "C:/xampp/htdocs/HireHub/backend/vendor/autoload.php";

use MongoDB\Client;

$client = new Client("mongodb://localhost:27017");

$db = $client->selectDatabase("hirehub");

$activityLogs = $db->selectCollection("activity_logs");

$log = $activityLogs->findOne();

echo "<h2>Activity Logs Collection</h2>";

echo "<pre>";
print_r($log);
echo "</pre>";

?>