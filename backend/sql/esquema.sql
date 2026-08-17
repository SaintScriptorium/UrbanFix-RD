CREATE DATABASE urbanfix_rd;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(160) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);


select * from users;

CREATE TYPE report_category AS ENUM (
    'Hoyos en la vía',
    'Aceras rotas',
    'Luminarias apagadas',
    'Drenaje obstruido',
    'Basura acumulada',
    'Señalización dañada'
);

CREATE TYPE report_province AS ENUM (
    'Santo Domingo',
    'Distrito Nacional',
    'Santiago',
    'San Cristóbal',
    'La Altagracia'
);

CREATE TABLE reports (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(140) NOT NULL,
    description  TEXT NOT NULL,
    category     report_category NOT NULL,
    province     report_province NOT NULL,
    -- HU8: "completado" no borra el registro, solo lo saca del feed.
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_feed
    ON reports (created_at DESC)
    WHERE is_completed = FALSE;

CREATE INDEX IF NOT EXISTS idx_reports_category
    ON reports (category)
    WHERE is_completed = FALSE;


CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();