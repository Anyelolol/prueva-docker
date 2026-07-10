<?php
require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../models/UsuarioModel.php';
require_once __DIR__ . '/../models/LogModeloModel.php';

class UsuarioController {

    public static function crear(): void {
        AuthMiddleware::role(['admin']);
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['nombre', 'apellido', 'email', 'password'] as $c) {
            if (empty($body[$c])) {
                http_response_code(422);
                echo json_encode(['error' => "Campo requerido: $c"]);
                return;
            }
        }
        if (!empty($body['rol']) && !in_array($body['rol'], ['admin', 'docente'], true)) {
            http_response_code(422);
            echo json_encode(['error' => 'Rol inválido']);
            return;
        }
        try {
            $u = UsuarioModel::crear($body);
            LogSistemaModel::registrar('usuarios', 'INFO', "Usuario creado: {$body['email']}", $u['uid']);
            http_response_code(201);
            echo json_encode($u);
        } catch (\PDOException $e) {
            if (str_contains($e->getMessage(), 'unique') || str_contains($e->getMessage(), 'duplicate')) {
                http_response_code(409);
                echo json_encode(['error' => 'Email ya registrado']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Error de base de datos']);
                LogSistemaModel::registrar('usuarios', 'ERROR', $e->getMessage(), null, $e->getTraceAsString());
            }
        }
    }

    public static function listar(): void {
        AuthMiddleware::role(['admin']);
        echo json_encode(UsuarioModel::listar());
    }

    public static function obtener(int $uid): void {
        $payload = AuthMiddleware::require();
        if ($payload['rol'] !== 'admin' && $payload['uid'] !== $uid) {
            http_response_code(403); echo json_encode(['error' => 'Sin permisos']); return;
        }
        $u = UsuarioModel::porId($uid);
        if (!$u) { http_response_code(404); echo json_encode(['error' => 'No encontrado']); return; }
        echo json_encode($u);
    }

    public static function actualizar(int $uid): void {
        $payload = AuthMiddleware::require();
        if ($payload['rol'] !== 'admin' && $payload['uid'] !== $uid) {
            http_response_code(403); echo json_encode(['error' => 'Sin permisos']); return;
        }
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        if ($payload['rol'] !== 'admin') unset($body['rol']);

        try {
            $u = UsuarioModel::actualizar($uid, $body);
        } catch (\RuntimeException $e) {
            http_response_code(409); echo json_encode(['error' => $e->getMessage()]); return;
        }
        if (!$u) { http_response_code(404); echo json_encode(['error' => 'No encontrado']); return; }
        LogSistemaModel::registrar('usuarios', 'INFO', "Usuario $uid actualizado", $payload['uid']);
        echo json_encode($u);
    }

    public static function eliminar(int $uid): void {
        AuthMiddleware::role(['admin']);
        try {
            UsuarioModel::eliminar($uid);
        } catch (\RuntimeException $e) {
            http_response_code(409); echo json_encode(['error' => $e->getMessage()]); return;
        }
        LogSistemaModel::registrar('usuarios', 'WARNING', "Usuario $uid desactivado");
        echo json_encode(['mensaje' => 'Usuario desactivado']);
    }
}
