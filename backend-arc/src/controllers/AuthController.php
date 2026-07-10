<?php
require_once __DIR__ . '/../models/UsuarioModel.php';
require_once __DIR__ . '/../models/LogModeloModel.php';
require_once __DIR__ . '/../config/jwt.php';

class AuthController {

    public static function register(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['nombre', 'apellido', 'email', 'password'] as $c) {
            if (empty($body[$c])) {
                http_response_code(422);
                echo json_encode(['error' => "Campo requerido: $c"]);
                return;
            }
        }
        try {
            $u = UsuarioModel::crear($body);
            LogSistemaModel::registrar('auth', 'INFO', "Registro: {$body['email']}", $u['uid']);
            http_response_code(201);
            echo json_encode($u);
        } catch (\PDOException $e) {
            if (str_contains($e->getMessage(), 'unique') || str_contains($e->getMessage(), 'duplicate')) {
                http_response_code(409);
                echo json_encode(['error' => 'Email ya registrado']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Error de base de datos']);
                LogSistemaModel::registrar('auth', 'ERROR', $e->getMessage(), null, $e->getTraceAsString());
            }
        }
    }

    public static function login(): void {
        $body    = json_decode(file_get_contents('php://input'), true) ?? [];
        $usuario = UsuarioModel::porEmail($body['email'] ?? '');

        if (!$usuario || !password_verify($body['password'] ?? '', $usuario['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Credenciales incorrectas']);
            LogSistemaModel::registrar('auth', 'WARNING', "Login fallido: {$body['email']}");
            return;
        }

        UsuarioModel::actualizarAcceso($usuario['uid']);
        $token = jwtEncode(['uid' => $usuario['uid'], 'rol' => $usuario['rol'], 'email' => $usuario['email']]);
        LogSistemaModel::registrar('auth', 'INFO', 'Login exitoso', $usuario['uid']);

        unset($usuario['password_hash']);
        echo json_encode(['token' => $token, 'usuario' => $usuario]);
    }

    public static function me(): void {
        require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
        $p = AuthMiddleware::require();
        $u = UsuarioModel::porId($p['uid']);
        if (!$u) { http_response_code(404); echo json_encode(['error' => 'No encontrado']); return; }
        echo json_encode($u);
    }
}
