-- Usuarios de prueba. TEMPORAL: usando @gmail.com mientras se decide
-- el whitelist de dominio institucional definitivo en el frontend.
--
-- user@gmail.com  / User123   (rol: docente)
-- admin@gmail.com / Admin123  (rol: admin)
--
-- Hashes generados con bcrypt (compatibles con password_verify() de PHP).

INSERT INTO usuario (nombre, apellido, email, password_hash, rol)
VALUES ('Usuario', 'Prueba', 'user@gmail.com',
        '$2b$10$CpbyVTcNpKVfnDRl8Wtt5eY0lXqJcKTToEJltG7cWsLAaR6BtAKri',
        'docente')
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuario (nombre, apellido, email, password_hash, rol)
VALUES ('Admin', 'Prueba', 'admin@gmail.com',
        '$2b$10$tJzh0zBrokIbCFYiDO2EaOc5MhUEC4XOr3YvIHQPpSaRLCOKpYvy6',
        'admin')
ON CONFLICT (email) DO NOTHING;
