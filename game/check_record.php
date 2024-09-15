<?php
header('Content-Type: application/json');

// Define the file path
$filename = 'times.txt';

// Read the JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Get the time from input
$time = isset($data['time']) ? (int)$data['time'] : null;

if ($time === null) {
    echo json_encode(['error' => 'Invalid time input.']);
    exit;
}

// Initialize an array for times
$times = [];

// Check if the file exists
if (file_exists($filename)) {
    // Read the current times from the file
    $times = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    // Convert times to integers
    $times = array_map('intval', $times);
}

// Determine if the new time is a record
$newRecord = false;
if (empty($times) || $time < min($times)) {
    $newRecord = true;
}

// Add the new time to the times array
$times[] = $time;

// Sort the times in ascending order
sort($times);

// Save the updated times back to the file
file_put_contents($filename, implode(PHP_EOL, $times));

// Return the result as JSON
echo json_encode(['newRecord' => $newRecord]);
?>
