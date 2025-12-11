<?php
// Chỉ cho phép POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(["status" => "error", "message" => "Method Not Allowed. Only POST is allowed."]);
    exit;
}

// Đọc dữ liệu JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON data."]);
    exit;
}

// Đường dẫn file data.json (từ process/ lên 1 cấp → json/)
$filePath = '../json/data.json';

if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) !== false) {
    echo json_encode(["status" => "ok", "message" => "Data saved successfully to data.json"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to write to data.json. Check file permissions or path."]);
}
?>