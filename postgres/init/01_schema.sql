CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USUARIO
CREATE TABLE IF NOT EXISTS usuario (
    uid            SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    apellido       VARCHAR(100) NOT NULL,
    email          VARCHAR(255) UNIQUE NOT NULL,
    password_hash  TEXT NOT NULL,
    rol            VARCHAR(50) NOT NULL DEFAULT 'docente'
                       CHECK (rol IN ('admin','docente')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    ultimo_acceso  TIMESTAMP,
    activo         BOOLEAN NOT NULL DEFAULT TRUE
);

-- MODELO_IA
CREATE TABLE IF NOT EXISTS modelo_ia (
    mid                 SERIAL PRIMARY KEY,
    nombre_modelo       VARCHAR(200) NOT NULL,
    version             VARCHAR(50)  NOT NULL,
    descripcion         TEXT,
    precision           NUMERIC(5,4),
    fecha_entrenamiento DATE,
    activo              BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO modelo_ia (nombre_modelo, version, descripcion, precision, fecha_entrenamiento, activo)
VALUES ('paraphrase-multilingual-mpnet-base-v2', '1.0', 'Modelo base multilingüe', 0.9200, '2024-01-01', TRUE)
ON CONFLICT DO NOTHING;

-- DOCUMENTO
CREATE TABLE IF NOT EXISTS documento (
    did            SERIAL PRIMARY KEY,
    uid            INTEGER NOT NULL REFERENCES usuario(uid) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(100),
    ruta_archivo   TEXT NOT NULL,
    hash_documento VARCHAR(64),
    tamano_bytes   BIGINT,
    fecha_subida   TIMESTAMP NOT NULL DEFAULT NOW(),
    estado         VARCHAR(50) NOT NULL DEFAULT 'pendiente'
                       CHECK (estado IN ('pendiente','procesando','completado','error')),
    log_error      TEXT
);

-- EVALUACION
CREATE TABLE IF NOT EXISTS evaluacion (
    eid              SERIAL PRIMARY KEY,
    did              INTEGER NOT NULL REFERENCES documento(did) ON DELETE CASCADE,
    uid              INTEGER NOT NULL REFERENCES usuario(uid),
    modelo_utilizado VARCHAR(200),
    version_modelo   VARCHAR(50),
    tipo_evaluacion  VARCHAR(100) NOT NULL DEFAULT 'similitud_semantica',
    fecha_evaluacion TIMESTAMP NOT NULL DEFAULT NOW(),
    score_plagio     NUMERIC(5,4),
    resultado        JSONB,
    estado           VARCHAR(50) NOT NULL DEFAULT 'pendiente'
                         CHECK (estado IN ('pendiente','procesando','completado','error')),
    log_error        TEXT
);

-- FUENTE_COINCIDENCIA
CREATE TABLE IF NOT EXISTS fuente_coincidencia (
    fid                     SERIAL PRIMARY KEY,
    eid                     INTEGER NOT NULL REFERENCES evaluacion(eid) ON DELETE CASCADE,
    fuente                  VARCHAR(100),
    url                     TEXT,
    titulo                  TEXT,
    porcentaje_coincidencia NUMERIC(5,2),
    texto_detectado         TEXT,
    texto_original          TEXT,
    fecha_deteccion         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SEGMENTO_PLAGIO
CREATE TABLE IF NOT EXISTS segmento_plagio (
    sid                  SERIAL PRIMARY KEY,
    eid                  INTEGER NOT NULL REFERENCES evaluacion(eid) ON DELETE CASCADE,
    inicio_documento     INTEGER,
    fin_documento        INTEGER,
    texto_documento      TEXT,
    texto_coincidente    TEXT,
    porcentaje_similitud NUMERIC(5,4)
);

-- LOG_SISTEMA
CREATE TABLE IF NOT EXISTS log_sistema (
    lid          SERIAL PRIMARY KEY,
    uid          INTEGER REFERENCES usuario(uid) ON DELETE SET NULL,
    modulo       VARCHAR(100),
    nivel        VARCHAR(20) NOT NULL DEFAULT 'INFO'
                     CHECK (nivel IN ('DEBUG','INFO','WARNING','ERROR','CRITICAL')),
    mensaje      TEXT NOT NULL,
    stacktrace   TEXT,
    fecha_evento TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_doc_uid      ON documento(uid);
CREATE INDEX IF NOT EXISTS idx_ev_did       ON evaluacion(did);
CREATE INDEX IF NOT EXISTS idx_ev_uid       ON evaluacion(uid);
CREATE INDEX IF NOT EXISTS idx_fuente_eid   ON fuente_coincidencia(eid);
CREATE INDEX IF NOT EXISTS idx_seg_eid      ON segmento_plagio(eid);
CREATE INDEX IF NOT EXISTS idx_log_uid      ON log_sistema(uid);
CREATE INDEX IF NOT EXISTS idx_log_nivel    ON log_sistema(nivel);
CREATE INDEX IF NOT EXISTS idx_log_fecha    ON log_sistema(fecha_evento);

