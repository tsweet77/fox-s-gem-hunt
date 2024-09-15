<?php
header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
header("Pragma: no-cache"); // HTTP 1.0.
header("Expires: 0"); // Proxies.
?>

<?php
// Define the file path
$filename = 'counter.txt';

// Check if the file exists
if (file_exists($filename)) {
    // Read the current count from the file
    $current_count = file_get_contents($filename);

    // Ensure the content is an integer
    $current_count = is_numeric($current_count) ? (int)$current_count : 0;

    // Increment the count by 1
    $new_count = $current_count + 1;
} else {
    // If file doesn't exist, start with 1
    $new_count = 1;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fox's Gem Hunt</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            flex-direction: column;
        }

        .form-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;
        }

        .flex-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        iframe {
            width: 650px; /* Increased width to allow extra space */
            height: 700px; /* Increased height to allow extra space */
            border: none;
            display: block; /* Removes extra space below the iframe */
        }

    </style>
    <script>
        function loadGame() {
            const selectedOption = document.querySelector('input[name="mode"]:checked').value;
            const iframe = document.getElementById('gameFrame');
            const submitButton = document.getElementById('submitButton');
            iframe.src = selectedOption + '.html';

            // Keep radio button state after loading
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('mode', selectedOption);
            history.replaceState(null, '', '?' + urlParams.toString());

            // Disable submit button while loading to prevent multiple clicks
            submitButton.disabled = true;
            iframe.onload = function () {
                submitButton.disabled = false;
            };
        }

        window.onload = function () {
            const urlParams = new URLSearchParams(window.location.search);
            const selectedMode = urlParams.get('mode');
            if (selectedMode) {
                document.querySelector(`input[name="mode"][value="${selectedMode}"]`).checked = true;
                loadGame();
            }
        }
    </script>
</head>
<body>
    <h1>Fox's Gem Hunt</h1>
    <div class="form-container">
        <div class="flex-container">
            <input type="radio" id="human" name="mode" value="human">
            <label for="human">Human</label>
            <input type="radio" id="computer" name="mode" value="computer">
            <label for="computer">Computer (AI)</label>
            <button id="submitButton" onclick="loadGame()">Submit</button>
        </div>
    </div>
    <iframe id="gameFrame"></iframe>
</body>
</html>
