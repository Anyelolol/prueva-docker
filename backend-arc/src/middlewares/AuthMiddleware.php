<?php
require_once __DIR__ . '/../config/jwt.php';

class AuthMiddleware {
    public static function require(): array {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!str_starts_with($header, 'Bearer ')) {
            http_response_code(401);
            echo json_encode(['error' => 'Token requerido']);
            exit;
        }
        $payload = jwtDecode(substr($header, 7));
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Token inválido o expirado']);
            exit;
        }
        return $payload;
    }

    public static function role(array $roles): array {
        $payload = self::require();
        if (!in_array($payload['rol'] ?? '', $roles, true)) {
            http_response_code(403);
            echo json_encode(['error' => 'Sin permisos suficientes']);
            exit;
        }
        return $payload;
    }
}
