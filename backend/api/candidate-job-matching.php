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

    $client = new Client(getenv("MONGODB_URI") ?: "mongodb://localhost:27017");

    $database = $client->selectDatabase("hirehub");

    $jobs = $database->selectCollection("jobs");
    $candidates = $database->selectCollection("candidates");

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

        echo json_encode([
            "success" => false,
            "message" => "Only GET method is allowed."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Candidate ID
    |--------------------------------------------------------------------------
    */

    if (empty($_GET['candidate_id'])) {

        echo json_encode([
            "success" => false,
            "message" => "candidate_id is required."
        ]);

        exit;
    }

    try {

        $candidateId =
            new ObjectId($_GET['candidate_id']);

    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid candidate ID."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Find Candidate
    |--------------------------------------------------------------------------
    */

    $candidate = $candidates->findOne([
        "user_id" => $candidateId
    ]);

    if (!$candidate) {

        echo json_encode([
            "success" => false,
            "message" => "Candidate profile not found."
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

            $skill = strtolower(
                trim((string) $skill)
            );

            if ($skill !== "") {
                $result[] = $skill;
            }
        }

        return array_values(
            array_unique($result)
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Candidate Skills
    |--------------------------------------------------------------------------
    */

    $candidateSkills =
        normalizeSkills(
            $candidate['skills'] ?? []
        );


    /*
    |--------------------------------------------------------------------------
    | Get Active Jobs
    |--------------------------------------------------------------------------
    */

    $jobList = $jobs->find([
        "status" => "active"
    ]);


    $matchedJobs = [];


    /*
    |--------------------------------------------------------------------------
    | Match Candidate Against Jobs
    |--------------------------------------------------------------------------
    */

    foreach ($jobList as $job) {

        $jobSkills =
            normalizeSkills(
                $job['skills'] ?? []
            );


        /*
        |----------------------------------------------------------------------
        | Matched Skills
        |----------------------------------------------------------------------
        */

        $matchedSkills = array_values(
            array_intersect(
                $candidateSkills,
                $jobSkills
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
                (
                    count($matchedSkills)
                    /
                    count($jobSkills)
                ) * 100
            );

        } else {

            $matchPercentage = 0;
        }


        /*
        |----------------------------------------------------------------------
        | Job Result
        |----------------------------------------------------------------------
        */

        $matchedJobs[] = [

            "job_id" =>
                (string) $job['_id'],

            "title" =>
                $job['title'] ?? "",

            "company_name" =>
                $job['company_name'] ?? "",

            "description" =>
                $job['description'] ?? "",

            "location" =>
                $job['location'] ?? "",

            "job_type" =>
                $job['job_type'] ?? "",

            "salary" =>
                $job['salary'] ?? "",

            "qualification" =>
                $job['qualification'] ?? "",

            "experience" =>
                $job['experience'] ?? "",

            "skills" =>
                $jobSkills,

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
        $matchedJobs,
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
            "Job matching completed successfully.",

        "candidate" => [

            "candidate_id" =>
                (string) $candidate['user_id'],

            "name" =>
                $candidate['full_name'] ?? "",

            "skills" =>
                $candidateSkills
        ],

        "count" =>
            count($matchedJobs),

        "jobs" =>
            $matchedJobs

    ], JSON_PRETTY_PRINT);

    exit;


} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" => "Server error.",

        "error" =>
            $e->getMessage()

    ], JSON_PRETTY_PRINT);

    exit;
}