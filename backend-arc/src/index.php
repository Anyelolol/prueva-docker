<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/models/LogModeloModel.php';
require_once __DIR__ . '/services/PlagiarismService.php';
require_once __DIR__ . '/routes/api.php';
