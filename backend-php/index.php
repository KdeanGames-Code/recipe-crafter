<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Test basic response
if (true) {
    echo json_encode(['status' => 'Test endpoint working']);
    exit;
}

$db_host = 'localhost';
$db_user = 'kdeannz5_recipe_user';
$db_pass = '[MmC@!12141970]';
$db_name = 'kdeannz5_recipe_crafter';

// Connect to the database
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]));
}

echo json_encode(['status' => 'Database connection successful']);
$conn->close();