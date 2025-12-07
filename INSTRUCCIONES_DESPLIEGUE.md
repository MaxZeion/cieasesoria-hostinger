# Guía de Despliegue en Dokploy

Esta guía detalla cómo desplegar la infraestructura para `cieasesoria.com` y `canaldenuncias.cieasesoria.com`.

## 1. Estructura de Carpetas

Se han creado dos carpetas en el proyecto:
- `/cieasesoria-web`: Contiene el Dockerfile para la web corporativa (Astro).
- `/globaleaks`: Contiene el docker-compose.yml para el Canal de Denuncias.

## 2. Despliegue Unificado (Recomendado)

Para evitar conflictos y simplificar la gestión, desplegaremos **ambos servicios juntos** usando el archivo `docker-compose.yml` de la raíz como un **Stack** único en Dokploy.

### Pasos en Dokploy:
1.  Ve a tu proyecto y selecciona la pestaña **Compose**.
2.  Crea un nuevo Stack (o usa el editor `docker-compose`).
3.  Copia el contenido del archivo `docker-compose.yml` que está en la raíz de este repositorio (`/cieasesoria/docker-compose.yml`).
4.  **Despliega (Deploy)**.

Dokploy levantará dos contenedores coordinados:
*   `cieasesoria-web`: Accesible en `cieasesoria.com` (construido desde la carpeta `./cieasesoria-web`).
*   `globaleaks`: Accesible en `canaldenuncias.cieasesoria.com` (imagen oficial).

Ambos compartirán automáticamente la red `dokploy-network` y los certificados SSL gestionados por Traefik.

## 4. Verificación y Solución de Problemas (GlobaLeaks)

Si al entrar a `https://canaldenuncias.cieasesoria.com` ves un error "Bad Gateway" o "404":

1.  **Espera unos minutos**: La primera vez, GlobaLeaks genera claves criptográficas y tarda un poco en arrancar.
2.  **Logs**: Revisa los logs en Dokploy (`docker logs globaleaks`) para ver si hay errores de permisos.

## 5. Configuración Inicial de GlobaLeaks (Día 1)

**IMPORTANTE: ¿Dónde configuro esto?**
Debes hacerlo **directamente en Producción (VPS)**, es decir, entrando a la URL real `https://canaldenuncias.cieasesoria.com`.

*   **¿Por qué no en local?**
    *   La base de datos se guarda en `./globaleaks/data`.
    *   Esa carpeta está en `.gitignore` por seguridad (no queremos subir denuncias reales a GitHub).
    *   Si lo configuras en tu PC, esos datos **NO** se subirán al VPS. El VPS arrancará limpio y tendrás que configurarlo allí de todas formas.

### Pasos una vez desplegado en el VPS:

1.  **Accede a la URL**: `https://canaldenuncias.cieasesoria.com`.
2.  **Wizard de Instalación**: Verás automáticamente el asistente de configuración.
    *   Te pedirá crear el usuario **Administrador**.
    *   Configurarás el **Nombre de la Entidad** (CIE Asesoría).
    *   Definirás los **Receptores** (quién recibe las denuncias).
3.  **Personalización**:
    *   Dentro del panel de admin, podrás subir el **Logotipo** y cambiar los colores para que coincidan con la web corporativa.
    *   Configura el **Cuestionario** que rellenarán los denunciantes.

**Nota Importante**: Toda esta configuración se guarda en la base de datos interna dentro de `/globaleaks/data` (en el servidor). No se sube nada de esto al Git por seguridad.
