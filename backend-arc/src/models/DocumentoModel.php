<?php
require_once __DIR__ . '/../config/db.php';

class DocumentoModel {

    public static function crear(array $d): array {
        $stmt = getDB()->prepare("
            INSERT INTO documento (uid, nombre_archivo, tipo_documento, ruta_archivo, hash_documento, tamano_bytes)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        ");
        $stmt->execute([
            $d['uid'],
            $d['nombre_archivo'],
            $d['tipo_documento']  ?? null,
            $d['ruta_archivo'],
            $d['hash_documento']  ?? null,
            $d['tamano_bytes']    ?? null,
        ]);
        return $stmt->fetch();
    }

    public static function porId(int $did): ?array {
        $stmt = getDB()->prepare("SELECT * FROM documento WHERE did = ?");
        $stmt->execute([$did]);
        return $stmt->fetch() ?: null;
    }

    public static function porUsuario(int $uid): array {
        $stmt = getDB()->prepare(
            "SELECT * FROM documento WHERE uid = ? ORDER BY fecha_subida DESC"
        );
        $stmt->execute([$uid]);
        return $stmt->fetchAll();
    }

    public static function listarTodos(): array {
        return getDB()
            ->query("SELECT d.*, u.email AS email_usuario
                     FROM documento d JOIN usuario u ON u.uid = d.uid
                     ORDER BY d.fecha_subida DESC")
            ->fetchAll();
    }

    public static function actualizarEstado(int $did, string $estado, ?string $logError = null): void {
        getDB()->prepare(
            "UPDATE documento SET estado = ?, log_error = ? WHERE did = ?"
        )->execute([$estado, $logError, $did]);
    }

    public static function eliminar(int $did): void {
        getDB()->prepare("DELETE FROM documento WHERE did = ?")->execute([$did]);
    }
}
