<?php
require_once __DIR__ . '/../config/db.php';

class UsuarioModel {

    public static function crear(array $d): array {
        $hash = password_hash($d['password'], PASSWORD_BCRYPT);
        $stmt = getDB()->prepare("
            INSERT INTO usuario (nombre, apellido, email, password_hash, rol)
            VALUES (?, ?, ?, ?, ?)
            RETURNING uid, nombre, apellido, email, rol, fecha_creacion, activo
        ");
        $stmt->execute([$d['nombre'], $d['apellido'], $d['email'], $hash, $d['rol'] ?? 'docente']);
        return $stmt->fetch();
    }

    public static function porEmail(string $email): ?array {
        $stmt = getDB()->prepare("SELECT * FROM usuario WHERE email = ? AND activo = TRUE");
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public static function porId(int $uid): ?array {
        $stmt = getDB()->prepare(
            "SELECT uid, nombre, apellido, email, rol, fecha_creacion, ultimo_acceso, activo
             FROM usuario WHERE uid = ?"
        );
        $stmt->execute([$uid]);
        return $stmt->fetch() ?: null;
    }

    public static function actualizarAcceso(int $uid): void {
        getDB()->prepare("UPDATE usuario SET ultimo_acceso = NOW() WHERE uid = ?")
               ->execute([$uid]);
    }

    public static function listar(): array {
        return getDB()
            ->query("SELECT uid, nombre, apellido, email, rol, fecha_creacion, ultimo_acceso, activo
                     FROM usuario ORDER BY fecha_creacion DESC")
            ->fetchAll();
    }

    public static function contarAdminsActivos(?int $excluirUid = null): int {
        $sql  = "SELECT COUNT(*) AS c FROM usuario WHERE rol = 'admin' AND activo = TRUE";
        $vals = [];
        if ($excluirUid !== null) {
            $sql .= " AND uid <> ?";
            $vals[] = $excluirUid;
        }
        $stmt = getDB()->prepare($sql);
        $stmt->execute($vals);
        return (int) $stmt->fetch()['c'];
    }

    public static function actualizar(int $uid, array $d): ?array {
        $actual = self::porId($uid);
        if (!$actual) return null;

        $dejariaDeSerAdminActivo =
            ($actual['rol'] === 'admin' && $actual['activo']) &&
            (
                (array_key_exists('rol', $d) && $d['rol'] !== 'admin') ||
                (array_key_exists('activo', $d) && !$d['activo'])
            );

        if ($dejariaDeSerAdminActivo && self::contarAdminsActivos($uid) === 0) {
            throw new \RuntimeException('No se puede modificar: debe existir al menos un administrador activo');
        }

        $fields = [];
        $vals   = [];
        foreach (['nombre', 'apellido', 'email', 'rol', 'activo'] as $f) {
            if (array_key_exists($f, $d)) {
                $fields[] = "$f = ?";
                $vals[]   = $d[$f];
            }
        }
        if (!empty($d['password'])) {
            $fields[] = "password_hash = ?";
            $vals[]   = password_hash($d['password'], PASSWORD_BCRYPT);
        }
        if (empty($fields)) return self::porId($uid);
        $vals[] = $uid;
        $stmt = getDB()->prepare(
            "UPDATE usuario SET " . implode(', ', $fields) . " WHERE uid = ?
             RETURNING uid, nombre, apellido, email, rol, fecha_creacion, ultimo_acceso, activo"
        );
        $stmt->execute($vals);
        return $stmt->fetch() ?: null;
    }

    public static function eliminar(int $uid): void {
        $actual = self::porId($uid);
        if (!$actual) return;

        if ($actual['rol'] === 'admin' && $actual['activo'] && self::contarAdminsActivos($uid) === 0) {
            throw new \RuntimeException('No se puede desactivar: debe existir al menos un administrador activo');
        }

        getDB()->prepare("UPDATE usuario SET activo = FALSE WHERE uid = ?")->execute([$uid]);
    }
}
