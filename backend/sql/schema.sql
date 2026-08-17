-- UrbanFix RD · Esquema de Base de Datos
-- Épica 1: Gestión de Usuarios
-- PostgreSQL 14+

-- gen_random_uuid() vive en pgcrypto en PG < 13; en PG 13+ ya está disponible
-- de forma nativa, pero habilitamos la extensión para no depender de la versión.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(160) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- La restricción UNIQUE de arriba ya crea un índice; lo dejamos explícito
-- porque el login siempre filtra por email y es la ruta más caliente del sistema.
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
