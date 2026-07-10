<?php
require_once __DIR__ . '/../config/db.php';

class FuenteCoincidenciaModel {

    public static function guardarLote(int $eid, array $fuentes): void {
        $stmt = getDB()->prepare("
            INSERT INTO fuente_coincidencia
                (eid, fuente, url, titulo, porcentaje_coincidencia, texto_detectado, texto_original)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($fuentes as $f) {
            $stmt->execute([
                $eid,
                $f['fuente']                  ?? null,
                $f['url']                     ?? null,
                $f['titulo']                  ?? null,
                $f['porcentaje_coincidencia'] ?? null,
                $f['texto_detectado']         ?? null,
                $f['texto_original']          ?? null,
            ]);
        }
    }

    public static function porEvaluacion(int $eid): array {
        $stmt = getDB()->prepare(
            "SELECT * FROM fuente_coincidencia WHERE eid = ? ORDER BY porcentaje_coincidencia DESC"
        );
        $stmt->execute([$eid]);
        return $stmt->fetchAll();
    }
}

class SegmentoPlagioModel {

    public static function guardarLote(int $eid, array $segmentos): void {
        $stmt = getDB()->prepare("
            INSERT INTO segmento_plagio
                (eid, inicio_documento, fin_documento, texto_documento, texto_coincidente, porcentaje_similitud)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        foreach ($segmentos as $s) {
            $stmt->execute([
                $eid,
                $s['inicio_documento']     ?? null,
                $s['fin_documento']        ?? null,
                $s['texto_documento']      ?? null,
                $s['texto_coincidente']    ?? null,
                $s['porcentaje_similitud'] ?? null,
            ]);
        }
    }

    public static function porEvaluacion(int $eid): array {
        $stmt = getDB()->prepare(
            "SELECT * FROM segmento_plagio WHERE eid = ? ORDER BY inicio_documento"
        );
        $stmt->execute([$eid]);
        return $stmt->fetchAll();
    }
}
