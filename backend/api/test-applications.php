<?php

require_once __DIR__ . '/vendor/autoload.php';

use MongoDB\Client;

$client = new Client("mongodb://localhost:27017");

$db = $client->selectDatabase("hirehub");

$applications = $db->selectCollection("applications");

echo "===== APPLICATIONS =====" . PHP_EOL;

foreach ($applications->find() as $application) {

    echo "Application ID: ";
    echo (string) $application['_id'];
    echo PHP_EOL;

    echo "Candidate ID: ";
    echo isset($application['candidate_id'])
        ? (string) $application['candidate_id']
        : 'MISSING';
    echo PHP_EOL;

    echo "Employer ID: ";
    echo isset($application['employer_id'])
        ? (string) $application['employer_id']
        : 'MISSING';
    echo PHP_EOL;

    echo "Job ID: ";
    echo isset($application['job_id'])
        ? (string) $application['job_id']
        : 'MISSING';
    echo PHP_EOL;

    echo "Job Title: ";
    echo $application['job_title'] ?? 'MISSING';
    echo PHP_EOL;

    echo "-------------------------" . PHP_EOL;
}