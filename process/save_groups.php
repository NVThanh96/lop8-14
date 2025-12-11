<?php
// process/save-groups.php
header("Access-Control-Allow-Origin: *"); // Nếu cần (cho local test)
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data === null) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Dữ liệu JSON không hợp lệ"]);
    exit;
}

// Đường dẫn file groups.json – PHẢI ĐÚNG
$filePath = "../json/groups.json";  // Điều chỉnh nếu cần: ../json/ hoặc json/

if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) !== false) {
    echo json_encode(["status" => "ok", "message" => "Lưu groups.json thành công"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Không thể ghi file groups.json – kiểm tra quyền ghi"]);
}
?>