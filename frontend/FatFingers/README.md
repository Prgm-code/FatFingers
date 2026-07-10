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
