<?php
function getDB(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $host = getenv('DB_HOST')     ?: 'localhost';
    $port = getenv('DB_PORT')     ?: '5432';
    $db   = getenv('DB_NAME')     ?: 'Plagidec';
    $user = getenv('DB_USER')     ?: 'leaf';
    $pass = getenv('DB_PASSWORD') ?: 'asdzxc';

    $dsn = "pgsql:host=$host;port=$port;dbname=$db;options='--client_encoding=UTF8'";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}
