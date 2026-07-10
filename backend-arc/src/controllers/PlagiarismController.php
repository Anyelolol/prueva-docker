<?php
require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../models/DocumentoModel.php';
require_once __DIR__ . '/../models/EvaluacionModel.php';
require_once __DIR__ . '/../models/FuenteSegmentoModel.php';
require_once __DIR__ . '/../models/LogModeloModel.php';
require_once __DIR__ . '/../services/PlagiarismService.php';
require_once __DIR__ . '/../services/UploadService.php';

class PlagiarismController {

    public static function check(): void {
        $payload = AuthMiddleware::require();
        $uid     = $payload['uid'];
        $body    = json_decode(file_get_contents('php://input'), true) ?? [];
        $did     = (int)($body['did'] ?? 0);

        $doc = DocumentoModel::porId($did);
        if (!$doc) {
            http_response_code(404);
            echo json_encode(['error' => 'Documento no encontrado']);
            return;
        }
        if ($payload['rol'] !== 'admin' && $doc['uid'] !== $uid) {
            http_response_code(403);
            echo json_encode(['error' => 'Sin permisos sobre este documento']);
            return;
        }

        $modelo = ModeloIAModel::activo();

        DocumentoModel::actualizarEstado($did, 'procesando');
        $ev  = EvaluacionModel::crear([
            'did'              => $did,
            'uid'              => $uid,
            'modelo_utilizado' => $modelo['nombre_modelo'] ?? null,
            'version_modelo'   => $modelo['version']       ?? null,
            'tipo_evaluacion'  => $body['tipo_evaluacion'] ?? 'similitud_semantica',
        ]);
        $eid = $ev['eid'];

        try {
            $texto = UploadService::leerTexto($doc['ruta_archivo']);
            $tipo  = $body['tipo_evaluacion'] ?? 'similitud_semantica';

            $referencia = $body['referencia'] ?? '';
            $didRef     = (int)($body['did_referencia'] ?? 0);
            if ($didRef && !$referencia) {
                $docRef = DocumentoModel::porId($didRef);
                if ($docRef && ($payload['rol'] === 'admin' || $docRef['uid'] === $uid)) {
                    $referencia = UploadService::leerTexto($docRef['ruta_archivo']);
                }
            }

            if ($tipo === 'deteccion_ia') {
                $deteccion = PlagiarismService::detect($texto);
                $result = [
                    'similarity'   => $deteccion['prob_ia'] ?? $deteccion['confidence'] ?? null,
                    'ia_detection' => $deteccion,
                ];
            } else {
                $result = PlagiarismService::analyze($texto, $referencia);
            }

            if (isset($result['error']) || (isset($result['ia_detection']['error']))) {
                throw new \RuntimeException($result['error'] ?? $result['ia_detection']['error']);
            }

            $score = (float)($result['similarity'] ?? 0.0);

            EvaluacionModel::completar($eid, $score, $result);
            DocumentoModel::actualizarEstado($did, 'completado');

            if (!empty($result['segments'])) {
                SegmentoPlagioModel::guardarLote($eid, $result['segments']);
            }
            if (!empty($result['sources'])) {
                FuenteCoincidenciaModel::guardarLote($eid, $result['sources']);
            }

            LogSistemaModel::registrar('plagio', 'INFO', "Evaluación $eid completada. Score: $score", $uid);

            $evCompleta              = EvaluacionModel::porId($eid);
            $evCompleta['segmentos'] = SegmentoPlagioModel::porEvaluacion($eid);
            $evCompleta['fuentes']   = FuenteCoincidenciaModel::porEvaluacion($eid);

            http_response_code(201);
            echo json_encode($evCompleta);

        } catch (\Throwable $e) {
            EvaluacionModel::marcarError($eid, $e->getMessage());
            DocumentoModel::actualizarEstado($did, 'error', $e->getMessage());
            LogSistemaModel::registrar('plagio', 'ERROR', $e->getMessage(), $uid, $e->getTraceAsString());
            http_response_code(502);
            echo json_encode(['error' => 'Error al procesar: ' . $e->getMessage()]);
        }
    }

    public static function resultado(int $eid): void {
        $payload = AuthMiddleware::require();
        $ev      = EvaluacionModel::porId($eid);
        if (!$ev) { http_response_code(404); echo json_encode(['error' => 'No encontrado']); return; }
        if ($payload['rol'] !== 'admin' && $ev['uid'] !== $payload['uid']) {
            http_response_code(403); echo json_encode(['error' => 'Sin permisos']); return;
        }
        $ev['segmentos'] = SegmentoPlagioModel::porEvaluacion($eid);
        $ev['fuentes']   = FuenteCoincidenciaModel::porEvaluacion($eid);
        echo json_encode($ev);
    }

    public static function historial(): void {
        $payload = AuthMiddleware::require();
        $rows    = $payload['rol'] === 'admin'
            ? EvaluacionModel::listarTodos()
            : EvaluacionModel::porUsuario($payload['uid']);
        echo json_encode($rows);
    }

    public static function health(): void {
        echo json_encode([
            'status'   => 'ok',
            'database' => (bool)getDB(),
            'ia'       => PlagiarismService::health(),
        ]);
    }
}
