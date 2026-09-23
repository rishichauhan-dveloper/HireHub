<?php
require_once __DIR__ . '/vendor/autoload.php';

use MongoDB\Client;

$client = new Client("mongodb://localhost:27017");
$db = $client->selectDatabase("hirehub");
$users = $db->selectCollection("users");

foreach ($users->find(["role" => "employer"]) as $user) {
    echo "EMPLOYER ID: " . (string)$user['_id'] . PHP_EOL;
    echo "NAME: " . ($user['name'] ?? "N/A") . PHP_EOL;
    echo "EMAIL: " . ($user['email'] ?? "N/A") . PHP_EOL;
    echo "ROLE: " . ($user['role'] ?? "N/A") . PHP_EOL;
    echo "------------------------" . PHP_EOL;
}
