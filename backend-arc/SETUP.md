# Dependencias del sistema — b-arc

Este backend usa `pdftotext` (del paquete `poppler-utils`) para extraer texto de PDFs
antes de mandarlo al servicio de detección IA (`b-ia`). No es una librería PHP,
por eso no aparece en Composer: es un binario que el servidor llama por línea de comandos.

## Instalar en el container `phpbox` (Distrobox / Fedora)

> Si vas a correr esto con Docker Compose, **no hace falta nada de lo de abajo**:
> el `Dockerfile` de este proyecto ya instala `poppler-utils` automáticamente
> al buildear la imagen. Esta guía es solo para correrlo directo en el
> container de desarrollo `phpbox` sin Docker.

Entrar al container y correr:

```bash
distrobox enter phpbox
sudo dnf install -y poppler-utils
```

Si `phpbox` está basado en Debian/Ubuntu en vez de Fedora:

```bash
sudo apt update && sudo apt install -y poppler-utils
```

## Verificar que quedó instalado

```bash
which pdftotext
pdftotext -v
```

Si `which pdftotext` no devuelve nada, el análisis de PDFs va a fallar con el error
"No se puede leer el PDF: falta instalar 'poppler-utils'" (agregado en `UploadService.php`).

## Notas

- Esto es un requisito del **servidor** donde corre `b-arc` (PHP), no de tu máquina de desarrollo.
- Si `phpbox` es un container efímero/reconstruible, conviene automatizar esta instalación
  en el script/Containerfile que lo arma, para no tener que repetirla a mano cada vez.
- `pdftotext` solo extrae texto ya seleccionable. PDFs escaneados (imagen pura) van a
  seguir devolviendo texto vacío — para esos casos hace falta OCR (ej. `tesseract`),
  que es un paso aparte y no está implementado todavía.
