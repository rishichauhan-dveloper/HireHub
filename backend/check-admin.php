<?php

require_once "C:/xampp/htdocs/HireHub/backend/vendor/autoload.php";

use MongoDB\Client;

$client = new Client("mongodb://localhost:27017");

$db = $client->selectDatabase("hirehub");

$users = $db->selectCollection("users");

$user = $users->findOne([
    "email" => "admin@hirehub.com"
]);

var_dump($user);

?>
