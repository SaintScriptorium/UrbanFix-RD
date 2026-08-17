# Pruebas Automatizadas - UrbanFix RD

Suite de pruebas E2E con **Selenium WebDriver** sobre **Node.js + Mocha**.
31 casos de prueba que cubren las 11 historias de usuario del primer release.

---

## Requisitos previos

| Requisito | Como verificarlo |
|---|---|
| Node.js 18+ | `node --version` |
| Google Chrome instalado | Abrirlo normalmente |
| Backend corriendo en el puerto 4000 | `http://localhost:4000/health` |
| Frontend corriendo en el puerto 5173 | `http://localhost:5173` |
| Base de datos PostgreSQL activa | Conectar desde pgAdmin 4 |

**No hace falta descargar ChromeDriver.** Selenium 4 incluye *Selenium
Manager*, que detecta la version de Chrome instalada y descarga el driver
correcto de forma automatica la primera vez que se ejecutan las pruebas.

---

## Instalacion (una sola vez)

Esta carpeta `tests/` va **al lado** de `backend/` y `frontend/`:

```
urbanfix rd/
├── backend/
├── frontend/
└── tests/        <-- esta carpeta
```

Abre una terminal en `tests/` y ejecuta:

```bash
npm install
```

---

## Como ejecutar las pruebas

Necesitas **tres terminales abiertas**:

| Terminal | Carpeta | Comando |
|---|---|---|
| 1 | `backend` | `npm run dev` |
| 2 | `frontend` | `npm run dev` |
| 3 | `tests` | `npm test` |

### Comandos disponibles

```bash
npm test              # Ejecuta las 31 pruebas (navegador visible)
npm run test:auth     # Solo Epica 1: HU1-HU4
npm run test:reports  # Solo Epica 2: HU5-HU8
npm run test:feed     # Solo Epica 3: HU9-HU11
npm run test:headless # Sin ventana de navegador (mas rapido)
npm run test:report   # Genera reporte HTML en mochawesome-report/
```

**Para grabar el video usa `npm test`** (no headless): el navegador se abre
y se ve como Selenium escribe, hace clic y navega solo.

---

## Que hace cada suite

| Archivo | Historias | Casos |
|---|---|---|
| `specs/01-auth.spec.js` | HU1, HU2, HU3, HU4 | CP-001 a CP-012 |
| `specs/02-reports.spec.js` | HU5, HU6, HU7, HU8 | CP-013 a CP-022 |
| `specs/03-feed.spec.js` | HU9, HU10, HU11 | CP-023 a CP-031 |

---

## Evidencia

- **Fallos:** cada prueba que falla guarda una captura PNG automatica en
  `evidencia/`.
- **Reporte HTML:** `npm run test:report` genera
  `mochawesome-report/mochawesome.html`, con el detalle de cada caso,
  su duracion y su resultado.

---

## Configuracion

Todo lo ajustable esta en `config.js`: puertos, tiempos de espera,
resoluciones y el usuario semilla. Tambien se puede sobrescribir por
variables de entorno:

```bash
BASE_URL=http://localhost:3000 npm test
HEADLESS=true npm test
```

---

## Problemas comunes

**`ECONNREFUSED` o todas las pruebas fallan de inmediato**
El backend o el frontend no estan corriendo. Verifica las terminales 1 y 2.

**`session not created: This version of ChromeDriver only supports...`**
Chrome se actualizo. Borra la cache del driver y vuelve a ejecutar:
- Windows: `%USERPROFILE%\.cache\selenium`
- Mac/Linux: `~/.cache/selenium`

**Las pruebas van muy lentas**
Usa `npm run test:headless`.

**`TimeoutError: Waiting for element to be located`**
Casi siempre significa que el frontend no tiene los atributos
`data-testid`. Verifica que reemplazaste los 8 archivos indicados en la
guia de instalacion.
