# FatFingers Landing Page

Landing pública de FatFingers construida como una cápsula Lakebed.

Producción: [https://fatfingers.lakebed.app/](https://fatfingers.lakebed.app/)

Ejecutar localmente:

```sh
npx lakebed dev
```

La página detecta macOS, Windows o Linux en el navegador y consulta el tag más
reciente mediante el badge público cacheado de Shields, evitando depender de la
cuota anónima de la API de GitHub. Los enlaces directos se construyen con el
patrón estable de nombres usado por el workflow de releases; la API pública de
GitHub queda como respaldo. Si no puede identificar el sistema ni resolver un
instalador, dirige a la página general de releases.

## Estructura

- `client/index.tsx`: composición de la página, navegación, CTAs y footer.
- `client/copy.ts`: todos los textos en español e inglés, los ejemplos de la
  demo y los resultados pregrabados de la prueba interactiva. Las demos nunca
  llaman a un proveedor de IA.
- `client/Headline.tsx`, `client/HeroScene.tsx`, `client/How.tsx`,
  `client/Playground.tsx` y `client/sections.tsx`: secciones de la página.
- `client/release.ts`: detección de plataforma y enlaces de descarga.
- `client/styles.ts`: CSS de la landing. Las animaciones respetan
  `prefers-reduced-motion`.
