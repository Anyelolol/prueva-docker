<?php
class PlagiarismService {

    private static function iaUrl(): string {
        return rtrim(getenv('IA_SERVICE_URL') ?: 'http://localhost:8000', '/');
    }

    public static function analyze(string $text, string $reference = ''): array {
        $url  = self::iaUrl() . '/analyze';
        $body = json_encode(['text' => $text, 'reference' => $reference]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 60,
        ]);

        $raw  = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err  = curl_error($ch);
        curl_close($ch);

        if ($err || $raw === false) {
            return ['error' => "cURL error: $err"];
        }
        $data = json_decode($raw, true);
        if ($code !== 200 || !$data) {
            return ['error' => "IA HTTP $code: $raw"];
        }
        return $data;
    }

    public static function health(): bool {
        $ch = curl_init(self::iaUrl() . '/health');
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]);
        $raw = curl_exec($ch);
        curl_close($ch);
        return (json_decode($raw ?? '', true)['status'] ?? '') === 'ok';
    }

    public static function detect(string $text): array {
        $url  = self::iaUrl() . '/detect';
        $body = json_encode(['text' => $text]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 60,
        ]);

        $raw  = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err  = curl_error($ch);
        curl_close($ch);

        if ($err || $raw === false) return ['error' => "cURL error: $err"];
        $data = json_decode($raw, true);
        if ($code !== 200 || !$data) return ['error' => "IA HTTP $code: $raw"];
        return $data;
    }
}
