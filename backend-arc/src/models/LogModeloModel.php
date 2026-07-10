<?php
require_once __DIR__ . '/../config/db.php';

class LogSistemaModel {

    public static function registrar(
        string  $modulo,
        string  $nivel,
        string  $mensaje,
        ?int    $uid        = null,
        ?string $stacktrace = null
    ): void {
        try {
            getDB()->prepare("
                INSERT INTO log_sistema (uid, modulo, nivel, mensaje, stacktrace)
                VALUES (?, ?, ?, ?, ?)
            ")->execute([$uid, $modulo, $nivel, $mensaje, $stacktrace]);
        } catch (\Throwable) {}
    }

    public static function listar(int $limit = 200, ?string $nivel = null, ?string $modulo = null): array {
        $where  = [];
        $params = [];
        if ($nivel)  { $where[] = "l.nivel = ?";  $params[] = $nivel; }
        if ($modulo) { $where[] = "l.modulo = ?"; $params[] = $modulo; }
        $sql = "SELECT l.*, u.email
                FROM log_sistema l LEFT JOIN usuario u ON u.uid = l.uid"
            . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
            . " ORDER BY l.fecha_evento DESC LIMIT ?";
        $params[] = $limit;
        $stmt = getDB()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}

class ModeloIAModel {

    public static function activo(): ?array {
        return getDB()
            ->query("SELECT * FROM modelo_ia WHERE activo = TRUE ORDER BY mid DESC LIMIT 1")
            ->fetch() ?: null;
    }

    public static function listar(): array {
        return getDB()->query("SELECT * FROM modelo_ia ORDER BY mid DESC")->fetchAll();
    }

    public static function porId(int $mid): ?array {
        $stmt = getDB()->prepare("SELECT * FROM modelo_ia WHERE mid = ?");
        $stmt->execute([$mid]);
        return $stmt->fetch() ?: null;
    }

    public static function crear(array $d): array {
        $stmt = getDB()->prepare("
            INSERT INTO modelo_ia (nombre_modelo, version, descripcion, precision, fecha_entrenamiento, activo)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        ");
        $stmt->execute([
            $d['nombre_modelo'],
            $d['version'],
            $d['descripcion']         ?? null,
            $d['precision']           ?? null,
            $d['fecha_entrenamiento'] ?? null,
            $d['activo']              ?? true,
        ]);
        return $stmt->fetch();
    }

    public static function actualizar(int $mid, array $d): ?array {
        $fields = [];
        $vals   = [];
        foreach (['nombre_modelo','version','descripcion','precision','fecha_entrenamiento','activo'] as $f) {
            if (array_key_exists($f, $d)) { $fields[] = "$f = ?"; $vals[] = $d[$f]; }
        }
        if (empty($fields)) return self::porId($mid);
        $vals[] = $mid;
        $stmt = getDB()->prepare(
            "UPDATE modelo_ia SET " . implode(', ', $fields) . " WHERE mid = ? RETURNING *"
        );
        $stmt->execute($vals);
        return $stmt->fetch() ?: null;
    }
}
