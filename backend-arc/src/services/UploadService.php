<?php
class UploadService {
    private static string $dir = '';

    private static function uploadDir(): string {
        if (self::$dir === '') {
            self::$dir = rtrim(getenv('UPLOAD_DIR') ?: __DIR__ . '/../../uploads', '/');
            if (!is_dir(self::$dir)) mkdir(self::$dir, 0775, true);
        }
        return self::$dir;
    }

    public static function guardar(array $file, int $uid): array {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \RuntimeException("Error al subir archivo (código {$file['error']})");
        }
        $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['pdf', 'doc', 'docx', 'txt', 'odt'];
        if (!in_array($ext, $allowed, true)) {
            throw new \RuntimeException("Extensión no permitida: .$ext");
        }

        $name = sprintf('%d_%s_%s.%s', $uid, date('Ymd_His'), bin2hex(random_bytes(4)), $ext);
        $dest = self::uploadDir() . '/' . $name;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new \RuntimeException("No se pudo mover el archivo");
        }

        return [
            'nombre_archivo' => $file['name'],
            'tipo_documento' => $ext,
            'ruta_archivo'   => $dest,
            'hash_documento' => hash_file('sha256', $dest),
            'tamano_bytes'   => filesize($dest),
        ];
    }

    public static function leerTexto(string $ruta): string {
        if (!file_exists($ruta)) {
            throw new \RuntimeException("Archivo no encontrado: $ruta");
        }
        $ext = strtolower(pathinfo($ruta, PATHINFO_EXTENSION));

        if ($ext === 'pdf') {
            if (!self::comandoDisponible('pdftotext')) {
                throw new \RuntimeException(
                    "No se puede leer el PDF: falta instalar 'poppler-utils' (comando pdftotext) en el servidor"
                );
            }
            $salida = [];
            $codigo = 0;
            exec('pdftotext ' . escapeshellarg($ruta) . ' - 2>&1', $salida, $codigo);
            $texto = implode("\n", $salida);
            if ($codigo !== 0) {
                throw new \RuntimeException("Error al extraer texto del PDF (pdftotext): $texto");
            }
            if (trim($texto) === '') {
                throw new \RuntimeException(
                    "El PDF no tiene texto extraíble (probablemente es un escaneo/imagen sin OCR)"
                );
            }
            return $texto;
        }

        $texto = (string) file_get_contents($ruta);
        if (trim($texto) === '') {
            throw new \RuntimeException("El documento está vacío o no se pudo leer");
        }
        return $texto;
    }

    private static function comandoDisponible(string $cmd): bool {
        $ruta = shell_exec('command -v ' . escapeshellarg($cmd) . ' 2>/dev/null');
        return !empty(trim((string) $ruta));
    }
}
