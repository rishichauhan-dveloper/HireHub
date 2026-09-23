<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

    /*
    |--------------------------------------------------------------------------
    | MongoDB
    |--------------------------------------------------------------------------
    */

    $client = new Client("mongodb://localhost:27017");

    $database = $client->selectDatabase("hirehub");

    $jobs = $database->selectCollection("jobs");
    $candidates = $database->selectCollection("candidates");


    /*
    |--------------------------------------------------------------------------
    | Only GET
    |--------------------------------------------------------------------------
    */

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

        echo json_encode([
            "success" => false,
            "message" => "Only GET method is allowed."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Job ID
    |--------------------------------------------------------------------------
    */

    if (empty($_GET['job_id'])) {

        echo json_encode([
            "success" => false,
            "message" => "job_id is required."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Validate Job ID
    |--------------------------------------------------------------------------
    */

    try {

        $jobId = new ObjectId($_GET['job_id']);

    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid job ID."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Find Job
    |--------------------------------------------------------------------------
    */

    $job = $jobs->findOne([
        "_id" => $jobId
    ]);

    if (!$job) {

        echo json_encode([
            "success" => false,
            "message" => "Job not found."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Normalize Skills
    |--------------------------------------------------------------------------
    */

    function normalizeSkills($skills)
    {
        if ($skills instanceof Traversable) {
            $skills = iterator_to_array($skills);
        }

        if (!is_array($skills)) {
            return [];
        }

        $result = [];

        foreach ($skills as $skill) {

            $skill = strtolower(trim((string) $skill));

            if ($skill !== "") {
                $result[] = $skill;
            }
        }

        return array_values(array_unique($result));
    }


    /*
    |--------------------------------------------------------------------------
    | Job Skills
    |--------------------------------------------------------------------------
    */

    $jobSkills = normalizeSkills(
        $job['skills'] ?? []
    );


    /*
    |--------------------------------------------------------------------------
    | Find Candidates
    |--------------------------------------------------------------------------
    */

    $candidateList = $candidates->find();

    $matchedCandidates = [];


    /*
    |--------------------------------------------------------------------------
    | Match Candidates
    |--------------------------------------------------------------------------
    */

    foreach ($candidateList as $candidate) {

        $candidateSkills = normalizeSkills(
            $candidate['skills'] ?? []
        );


        /*
        |----------------------------------------------------------------------
        | Matched Skills
        |----------------------------------------------------------------------
        */

        $matchedSkills = array_values(
            array_intersect(
                $jobSkills,
                $candidateSkills
            )
        );


        /*
        |----------------------------------------------------------------------
        | Missing Skills
        |----------------------------------------------------------------------
        */

        $missingSkills = array_values(
            array_diff(
                $jobSkills,
                $candidateSkills
            )
        );


        /*
        |----------------------------------------------------------------------
        | Match Percentage
        |----------------------------------------------------------------------
        */

        if (count($jobSkills) > 0) {

            $matchPercentage = round(
                (count($matchedSkills) / count($jobSkills)) * 100
            );

        } else {

            $matchPercentage = 0;
        }


        /*
        |----------------------------------------------------------------------
        | Candidate Name
        |----------------------------------------------------------------------
        */

        $candidateName =
            $candidate['full_name']
            ?? "Candidate";


        /*
        |----------------------------------------------------------------------
        | Candidate Result
        |----------------------------------------------------------------------
        */

        $matchedCandidates[] = [

            "candidate_id" =>
                isset($candidate['user_id'])
                    ? (string) $candidate['user_id']
                    : (string) $candidate['_id'],

            "name" =>
                $candidateName,

            "email" =>
                $candidate['email'] ?? "",

            "candidate_skills" =>
                $candidateSkills,

            "matched_skills" =>
                $matchedSkills,

            "missing_skills" =>
                $missingSkills,

            "match_percentage" =>
                $matchPercentage
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | Rank Highest Match First
    |--------------------------------------------------------------------------
    */

    usort(
        $matchedCandidates,
        function ($a, $b) {

            return
                $b['match_percentage']
                <=>
                $a['match_percentage'];
        }
    );


    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    echo json_encode([

        "success" => true,

        "message" =>
            "Candidate matching completed successfully.",

        "job" => [

            "job_id" =>
                (string) $job['_id'],

            "title" =>
                $job['title'] ?? "",

            "skills" =>
                $jobSkills
        ],

        "count" =>
            count($matchedCandidates),

        "candidates" =>
            $matchedCandidates
    ], JSON_PRETTY_PRINT);

    exit;


} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Server error.",

        "error" =>
            $e->getMessage()
    ], JSON_PRETTY_PRINT);

    exit;
}