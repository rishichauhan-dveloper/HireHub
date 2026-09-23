<?php

require_once __DIR__ . '/vendor/autoload.php';

use MongoDB\Client;

try {

    $client = new Client("mongodb://localhost:27017");

    $database = $client->selectDatabase("hirehub");

    $users = $database->selectCollection("users");

    $email = "admin@hirehub.com";

    // Check whether admin already exists
    $existingAdmin = $users->findOne([
        "email" => $email
    ]);

    if ($existingAdmin) {

        echo "Admin already exists.\n";
        echo "Admin ID: " . $existingAdmin['_id'] . "\n";

        exit;
    }

    $password = "admin123";

    $hashedPassword = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $admin = [
        "name" => "HireHub Admin",
        "email" => $email,
        "password" => $hashedPassword,
        "role" => "admin",
        "phone" => "",
        "status" => "active",
        "created_at" => new MongoDB\BSON\UTCDateTime()
    ];

    $result = $users->insertOne($admin);

    echo "Admin created successfully!\n";
    echo "Admin ID: " . $result->getInsertedId() . "\n";
    echo "Email: " . $email . "\n";
    echo "Password: admin123\n";

} catch (Exception $e) {

    echo "Error: " . $e->getMessage();

}

?>