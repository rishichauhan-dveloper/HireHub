<?php
require_once __DIR__ . '/vendor/autoload.php';

use MongoDB\Client;

$client = new Client("mongodb://localhost:27017");
$db = $client->selectDatabase("hirehub");
$applications = $db->selectCollection("applications");

foreach ($applications->find() as $a) {
    echo "APPLICATION: " . (string)$a['_id'] . PHP_EOL;
    echo "EMPLOYER: " . (isset($a['employer_id']) ? (string)$a['employer_id'] : "MISSING") . PHP_EOL;
    echo "CANDIDATE: " . (isset($a['candidate_id']) ? (string)$a['candidate_id'] : "MISSING") . PHP_EOL;
    echo "JOB: " . (isset($a['job_id']) ? (string)$a['job_id'] : "MISSING") . PHP_EOL;
    echo "TITLE: " . ($a['job_title'] ?? "MISSING") . PHP_EOL;
    echo "------------------------" . PHP_EOL;
}
