<?php

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

try {
    $client = new Client(getenv('MONGODB_URI') ?: "mongodb://localhost:27017");

    $database = $client->selectDatabase("hirehub");

    echo "MongoDB Connected Successfully!";

} catch (Exception $e) {
    echo "MongoDB Connection Failed: " . $e->getMessage();
}

?>