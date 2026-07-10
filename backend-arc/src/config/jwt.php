<?php
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'cambia_en_produccion');
define('JWT_TTL',    (int)(getenv('JWT_TTL') ?: 3600));

function jwtEncode(array $payload): string {
    $h = base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_TTL;
    $c = base64url(json_encode($payload));
    $s = base64url(hash_hmac('sha256', "$h.$c", JWT_SECRET, true));
    return "$h.$c.$s";
}

function jwtDecode(string $token): ?array {
    $p = explode('.', $token);
    if (count($p) !== 3) return null;
    [$h, $c, $s] = $p;
    if (!hash_equals(base64url(hash_hmac('sha256', "$h.$c", JWT_SECRET, true)), $s)) return null;
    $data = json_decode(base64_decode(strtr($c, '-_', '+/')), true);
    if (!$data || $data['exp'] < time()) return null;
    return $data;
}

function base64url(string $d): string {
    return rtrim(strtr(base64_encode($d), '+/', '-_'), '=');
}
