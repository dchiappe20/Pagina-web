# RendApps — Sitio web

Sitio web corporativo de **RendApps** (Informática Daniel Chiappe Puebla E.I.R.L.), construido con
Node.js, Express y plantillas EJS. Desarrollo de software y aplicaciones a medida.

**Identidad visual**: minimalista, mucho espacio en blanco, mockups de aplicaciones e íconos lineales.

- Fondo `#FFFFFF` · fondo alternativo `#F8FAFC` · texto `#111827`
- Azul principal `#2563EB` · azul oscuro `#1E3A8A` · naranja CTA `#F97316`
- Tipografías: **Space Grotesk** (títulos) e **Inter** (textos)

## Requisitos

- Node.js 18 o superior

## Cómo ejecutarlo

```bash
npm install
npm start
```

Luego abre <http://localhost:3000> en el navegador.

## Páginas

| Ruta         | Contenido                                                        |
| ------------ | ---------------------------------------------------------------- |
| `/`          | Inicio: héroe con mockup, servicios, proyectos, proceso y CTA     |
| `/servicios` | Detalle de los 6 servicios con puntos incluidos                   |
| `/proyectos` | Portafolio: caso real (Amilab) y productos propios en desarrollo  |
| `/nosotros`  | Historia, compromisos de confianza y seguridad, proceso           |
| `/soporte`   | Soporte, documentación y preguntas frecuentes                     |
| `/contacto`  | Formulario de contacto (POST) con validación y datos directos     |
| `/productos` | Redirige (301) a `/servicios` — compatibilidad con enlaces viejos |

## Estructura

```
server.js          Servidor Express: rutas, datos (servicios, proyectos, proceso), empresa y keep-alive
views/             Plantillas EJS (partials/header, footer e icono — íconos lineales SVG)
public/css/        Hoja de estilos (paleta y variables en :root)
public/js/         Menú móvil, sombra de cabecera y animaciones de aparición
public/img/        Mockups SVG (hero y proyectos) y favicon
```

## Despliegue en Render

Configurado como **Web Service** (Build: `npm install` · Start: `npm start`). Incluye
**keep-alive**: si existe `RENDER_EXTERNAL_URL` (Render la define automáticamente), el servidor
se auto-pinguea cada 5 minutos para no dormirse por inactividad. En local queda desactivado.

## Datos pendientes de completar

Marcados en el sitio con un borde punteado naranja (clase `placeholder-tag`):

- Nombre y descripción reales de **Aplicación 1** y **Aplicación 2** (arreglo `proyectos` en `server.js`).
- Correos y teléfono definitivos (`contacto@rendapps.dev`, `soporte@rendapps.dev`, `+56 9 XXXX XXXX`),
  definidos en `app.locals.empresa` dentro de `server.js`.

Para cambiar la paleta, edita las variables al inicio de `public/css/styles.css`.
Los servicios, proyectos y datos de la empresa se editan en `server.js`.
