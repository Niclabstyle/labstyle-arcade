# Labstyle Arcade

Sitio estático (HTML + CSS + JS clásico + Three.js r128). No necesita build.

## Probar en local
Los modelos `.glb` se cargan con `fetch`, así que hay que abrirlo con un servidor (no con doble clic / `file://`):

    python3 -m http.server 8000      # o: npx serve .
    # abre http://localhost:8000

## Desplegar
GitHub → Vercel (sin framework, sin comando de build, carpeta de salida: la raíz).
`vercel.json` solo agrega cabeceras de caché.

## Estructura
    index.html             página principal (SEO, fuentes, enlaces a css/js)
    landing.html           portada (se muestra en un iframe desde js/main.js)
    css/styles.css         estilos base, juegos, fondos, panel final e indicador de carga
    css/skin-circo.css     skin de toldo/marquesina (quita su <link> para desactivarlo)
    css/landing.css        estilos de la portada
    js/icons.js            reemplaza emojis por íconos 3D
    js/chemistry-games.js  datos y minijuegos (play, hud, answer, verdict, eqCheck, org, maze...)
    js/main.js             núcleo: audio, idioma, menús, pasillo 3D, puertas, LabModels, arranque
    js/landing.js          lógica de la portada
    vendor/                three.min.js y GLTFLoader.js (r128, copia local)
    assets/models/*.glb    Pomni, Ragatha, Jax, Caine, Gangle (se descargan al tocar su puerta)
    assets/img/            fondos de circo y stickers

Orden de scripts (index.html): three → GLTFLoader → icons → chemistry-games → main.
Son scripts clásicos que comparten el ámbito global (las plantillas usan onclick="play(...)").

## Notas
- /_vercel/insights/script.js solo existe desplegado en Vercel (en local da 404 y es normal).
- icon-192.png, icon-512.png, og.png y manifest.webmanifest son de reemplazo: si ya tienes los tuyos, conserva los tuyos.
- Modelos 3D de Sketchfab con licencia CC BY 4.0: mantén el bloque de créditos de index.html.
