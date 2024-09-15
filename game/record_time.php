<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Define the file path
$filename = 'times.txt';

// Get the time sent from the game
if (isset($_POST['time'])) {
    $new_time = intval($_POST['time']);
    echo "Received time: " . $new_time . "\n"; // Debugging output

    // Read existing times from the file or initialize an empty array if file doesn't exist
    $times = [];
    if (file_exists($filename)) {
        $file_content = file_get_contents($filename);
        if ($file_content === false) {
            die("Error reading the file.");
        } elseif (!empty($file_content)) {
            $times = explode("\n", trim($file_content));
            $times = array_map('intval', $times);
        }
    }

    // Add the new time to the list
    $times[] = $new_time;

    // Sort the times in ascending order
    sort($times);

    // Write the updated list back to the file
    if (file_put_contents($filename, implode("\n", $times)) === false) {
        die("Failed to write to file.");
    } else {
        echo "File written successfully.\n";
    }

    // Check if the new time is a record
    if ($new_time == $times[0]) {
        echo "New Record";
    } else {
        // Convert the minimum time to minutes and seconds
        $min_time = min($times);
        $minutes = floor($min_time / 60000); // Convert milliseconds to minutes
        $seconds = floor(($min_time % 60000) / 1000); // Convert remaining milliseconds to seconds
        echo "Record Time: " . $minutes . "m " . $seconds . "s";
    }
} else {
    echo "No time sent.";
}
?>
