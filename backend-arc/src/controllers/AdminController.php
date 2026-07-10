<?php
require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../models/LogModeloModel.php';

class AdminController {

    public static function logs(): void {
        AuthMiddleware::role(['admin']);
        $limit  = (int)($_GET['limit']  ?? 200);
        $nivel  = $_GET['nivel']  ?? null;
        $modulo = $_GET['modulo'] ?? null;
        echo json_encode(LogSistemaModel::listar($limit, $nivel, $modulo));
    }

    public static function listarModelos(): void {
        AuthMiddleware::require();
        echo json_encode(ModeloIAModel::listar());
    }

    public static function crearModelo(): void {
        AuthMiddleware::role(['admin']);
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($body['nombre_modelo']) || empty($body['version'])) {
            http_response_code(422);
            echo json_encode(['error' => 'nombre_modelo y version son requeridos']);
            return;
        }
        http_response_code(201);
        echo json_encode(ModeloIAModel::crear($body));
    }

    public static function actualizarModelo(int $mid): void {
        AuthMiddleware::role(['admin']);
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $m    = ModeloIAModel::actualizar($mid, $body);
        if (!$m) { http_response_code(404); echo json_encode(['error' => 'No encontrado']); return; }
        echo json_encode($m);
    }
}
