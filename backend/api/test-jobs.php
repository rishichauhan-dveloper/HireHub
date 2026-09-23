<?php

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

try {

    $client = new Client("mongodb://localhost:27017");

    $db = $client->selectDatabase("hirehub");

    echo "===== JOBS =====\n";

    $jobs = $db->selectCollection("jobs");

    foreach ($jobs->find() as $job) {

        echo "ID: " . ($job['_id'] ?? '') . "\n";
        echo "Title: " . ($job['title'] ?? '') . "\n";
        echo "Skills: " . json_encode($job['skills'] ?? []) . "\n";
        echo "-------------------------\n";
    }

    echo "\n===== CANDIDATES =====\n";

    $candidates = $db->selectCollection("candidates");

    foreach ($candidates->find() as $candidate) {

        echo "ID: " . ($candidate['_id'] ?? '') . "\n";
        echo "Name: " . ($candidate['full_name'] ?? '') . "\n";
        echo "Email: " . ($candidate['email'] ?? '') . "\n";
        echo "Skills: " . json_encode($candidate['skills'] ?? []) . "\n";
        echo "-------------------------\n";
    }

} catch (Exception $e) {

    echo "ERROR: " . $e->getMessage();
}