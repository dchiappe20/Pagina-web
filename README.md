# RendApps Solutions — Sitio web

Sitio web clásico multipágina de **Informática Daniel Chiappe Puebla E.I.R.L.**, construido con
Node.js, Express y plantillas EJS. Desarrollo de software y aplicaciones a medida.
Paleta: granate (`#6B1621`) para cabecera, pie y botones; greige cálido para el resto.

## Requisitos

- Node.js 18 o superior

## Cómo ejecutarlo

```bash
npm install
npm start
```

Luego abre <http://localhost:3000> en el navegador.

## Páginas

| Ruta         | Contenido                                              |
| ------------ | ------------------------------------------------------ |
| `/`          | Inicio: héroe, productos destacados y ventajas         |
| `/nosotros`  | Historia, forma de trabajo y equipo                    |
| `/productos` | Catálogo con filtro por categoría y buscador (`?q=`)   |
| `/soporte`   | Soporte, documentación y preguntas frecuentes          |
| `/contacto`  | Formulario de contacto (POST) con validación           |

## Estructura

```
server.js          Servidor Express: rutas, datos de productos, datos de empresa y formulario
views/             Plantillas EJS (partials/header.ejs y footer.ejs compartidos)
public/css/        Hoja de estilos (paleta y variables en :root)
public/js/         Menú móvil y submenús desplegables
public/img/        Íconos SVG de categorías y favicon
```

## Datos pendientes de completar

Marcados en el sitio con un borde punteado (clase `placeholder-tag`):

- Nombre y descripción reales de **Aplicación 1** y **Aplicación 2** (en `server.js`).
- Nombre del **Colaborador** de marketing (en `views/nosotros.ejs`).
- Correos y teléfono reales (`contacto@rendapps.dev`, `soporte@rendapps.dev`, `+56 9 XXXX XXXX`),
  definidos en `app.locals.empresa` dentro de `server.js`.

Para cambiar la paleta, edita las variables `--rojo-*` y `--gris-*` al inicio de
`public/css/styles.css`. Los productos y los datos de la empresa se editan en `server.js`.
