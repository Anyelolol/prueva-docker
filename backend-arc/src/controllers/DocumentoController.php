<?php
require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../models/DocumentoModel.php';
require_once __DIR__ . '/../models/LogModeloModel.php';
require_once __DIR__ . '/../services/UploadService.php';

class DocumentoController {

    public static function subir(): void {
        $payload = AuthMiddleware::require();
        $uid     = $payload['uid'];

        if (empty($_FILES['archivo'])) {
            http_response_code(422);
            echo json_encode(['error' => 'Se requiere campo multipart "archivo"']);
            return;
        }
        try {
            $meta = UploadService::guardar($_FILES['archivo'], $uid);
            $doc  = DocumentoModel::crear(['uid' => $uid, ...$meta]);
            LogSistemaModel::registrar('documentos', 'INFO', "Doc subido: {$doc['did']}", $uid);
            http_response_code(201);
            echo json_encode($doc);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
            LogSistemaModel::registrar('documentos', 'ERROR', $e->getMessage(), $uid, $e->getTraceAsString());
        }
    }

    public static function listar(): void {
        $payload = AuthMiddleware::require();
        $docs    = $payload['rol'] === 'admin'
            ? DocumentoModel::listarTodos()
            : DocumentoModel::porUsuario($payload['uid']);
        echo json_encode($docs);
    }

    public static function obtener(int $did): void {
        $payload = AuthMiddleware::require();
        $doc     = DocumentoModel::porId($did);
        if (!$doc) { http_response_code(404); echo json_encode(['error' => 'No encontrado']); return; }
        if ($payload['rol'] !== 'admin' && $doc['uid'] !== $payload['uid']) {
            http_response_code(403); echo json_encode(['error' => 'Sin permisos']); return;
        }
        echo json_encode($doc);
    }

    public static function eliminar(int $did): void {
        $payload = AuthMiddleware::require();
        $doc     = DocumentoModel::porId($did);
        if (!$doc) { http_response_code(404); echo json_encode(['error' => 'No encontrado']); return; }
        if ($payload['rol'] !== 'admin' && $doc['uid'] !== $payload['uid']) {
            http_response_code(403); echo json_encode(['error' => 'Sin permisos']); return;
        }
        if (file_exists($doc['ruta_archivo'])) @unlink($doc['ruta_archivo']);
        DocumentoModel::eliminar($did);
        LogSistemaModel::registrar('documentos', 'WARNING', "Doc $did eliminado", $payload['uid']);
        echo json_encode(['mensaje' => 'Documento eliminado']);
    }
}
