<?php
require_once __DIR__ . '/../config/db.php';

class EvaluacionModel {

    public static function crear(array $d): array {
        $stmt = getDB()->prepare("
            INSERT INTO evaluacion (did, uid, modelo_utilizado, version_modelo, tipo_evaluacion, estado)
            VALUES (?, ?, ?, ?, ?, 'procesando')
            RETURNING *
        ");
        $stmt->execute([
            $d['did'],
            $d['uid'],
            $d['modelo_utilizado'] ?? null,
            $d['version_modelo']   ?? null,
            $d['tipo_evaluacion']  ?? 'similitud_semantica',
        ]);
        return $stmt->fetch();
    }

    public static function completar(int $eid, float $score, array $resultado): void {
        getDB()->prepare("
            UPDATE evaluacion
            SET estado = 'completado', score_plagio = ?, resultado = ?::jsonb, fecha_evaluacion = NOW()
            WHERE eid = ?
        ")->execute([$score, json_encode($resultado), $eid]);
    }

    public static function marcarError(int $eid, string $log): void {
        getDB()->prepare(
            "UPDATE evaluacion SET estado = 'error', log_error = ? WHERE eid = ?"
        )->execute([$log, $eid]);
    }

    public static function porId(int $eid): ?array {
        $stmt = getDB()->prepare("SELECT * FROM evaluacion WHERE eid = ?");
        $stmt->execute([$eid]);
        $ev = $stmt->fetch();
        if (!$ev) return null;
        if ($ev['resultado']) $ev['resultado'] = json_decode($ev['resultado'], true);
        return $ev;
    }

    public static function porDocumento(int $did): array {
        $stmt = getDB()->prepare(
            "SELECT * FROM evaluacion WHERE did = ? ORDER BY fecha_evaluacion DESC"
        );
        $stmt->execute([$did]);
        return array_map(fn($r) => array_merge($r, [
            'resultado' => $r['resultado'] ? json_decode($r['resultado'], true) : null
        ]), $stmt->fetchAll());
    }

    public static function porUsuario(int $uid): array {
        $stmt = getDB()->prepare("
            SELECT e.*, d.nombre_archivo
            FROM evaluacion e JOIN documento d ON d.did = e.did
            WHERE e.uid = ?
            ORDER BY e.fecha_evaluacion DESC
        ");
        $stmt->execute([$uid]);
        return array_map(fn($r) => array_merge($r, [
            'resultado' => $r['resultado'] ? json_decode($r['resultado'], true) : null
        ]), $stmt->fetchAll());
    }

    public static function listarTodos(): array {
        $rows = getDB()->query("
            SELECT e.*, d.nombre_archivo, u.email
            FROM evaluacion e
            JOIN documento d ON d.did = e.did
            JOIN usuario u   ON u.uid = e.uid
            ORDER BY e.fecha_evaluacion DESC
        ")->fetchAll();
        return array_map(fn($r) => array_merge($r, [
            'resultado' => $r['resultado'] ? json_decode($r['resultado'], true) : null
        ]), $rows);
    }
}
