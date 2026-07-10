<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/UsuarioController.php';
require_once __DIR__ . '/../controllers/DocumentoController.php';
require_once __DIR__ . '/../controllers/PlagiarismController.php';
require_once __DIR__ . '/../controllers/AdminController.php';

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = preg_replace('#^/api#', '', $uri) ?? $uri;
$method = $_SERVER['REQUEST_METHOD'];
$m      = [];

match (true) {
    $uri === '/auth/register' && $method === 'POST' => AuthController::register(),
    $uri === '/auth/login'    && $method === 'POST' => AuthController::login(),
    $uri === '/auth/me'       && $method === 'GET'  => AuthController::me(),

    $uri === '/usuarios'      && $method === 'GET'  => UsuarioController::listar(),
    $uri === '/usuarios'      && $method === 'POST' => UsuarioController::crear(),
    (bool)preg_match('#^/usuarios/(\d+)$#', $uri, $m) && $method === 'GET'    => UsuarioController::obtener((int)$m[1]),
    (bool)preg_match('#^/usuarios/(\d+)$#', $uri, $m) && $method === 'PUT'    => UsuarioController::actualizar((int)$m[1]),
    (bool)preg_match('#^/usuarios/(\d+)$#', $uri, $m) && $method === 'DELETE' => UsuarioController::eliminar((int)$m[1]),

    $uri === '/documentos'    && $method === 'POST' => DocumentoController::subir(),
    $uri === '/documentos'    && $method === 'GET'  => DocumentoController::listar(),
    (bool)preg_match('#^/documentos/(\d+)$#', $uri, $m) && $method === 'GET'    => DocumentoController::obtener((int)$m[1]),
    (bool)preg_match('#^/documentos/(\d+)$#', $uri, $m) && $method === 'DELETE' => DocumentoController::eliminar((int)$m[1]),

    $uri === '/check'         && $method === 'POST' => PlagiarismController::check(),
    $uri === '/check'         && $method === 'GET'  => PlagiarismController::historial(),
    (bool)preg_match('#^/check/(\d+)$#', $uri, $m) && $method === 'GET' => PlagiarismController::resultado((int)$m[1]),

    $uri === '/admin/logs'    && $method === 'GET'  => AdminController::logs(),

    $uri === '/modelos'       && $method === 'GET'  => AdminController::listarModelos(),
    $uri === '/modelos'       && $method === 'POST' => AdminController::crearModelo(),
    (bool)preg_match('#^/modelos/(\d+)$#', $uri, $m) && $method === 'PUT' => AdminController::actualizarModelo((int)$m[1]),

    $uri === '/health'        && $method === 'GET'  => PlagiarismController::health(),

    default => http_response_code(404) && print(json_encode(['error' => "Ruta no encontrada: $method $uri"])),
};
