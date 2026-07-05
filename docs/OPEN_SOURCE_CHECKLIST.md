# Open Source Checklist

Estado: preparado para publicacion inicial del repositorio, pendiente antes de release estable.

## Listo

- README con estado MVP alpha.
- Licencia MIT.
- Contributing guide.
- Security policy.
- Code of Conduct.
- Changelog inicial.
- Issue templates.
- Pull request template.
- Workflow CI multiplataforma.
- `.env.example` sin secretos.
- `.gitignore` cubre entornos locales y build output.
- Docs principales sincronizados con la implementacion actual.

## Antes de hacer publico el repo

- Confirmar nombre final del owner/org.
- Confirmar que la licencia MIT y el copyright `FatFingers contributors` son correctos.
- Revisar que no existan secrets en historial git.
- Revisar `.env` local y no commitearlo.
- Revisar screenshots o fixtures antes de subirlos.
- Definir si GitHub Security Advisories estara habilitado.

## Antes del primer release estable

- QA manual macOS.
- QA manual Windows.
- Revisar empaquetado final por plataforma.
- Definir iconos finales.
- Definir politica de releases y versionado.
- Validar provider real con API key del maintainer.
- Revisar soporte real de keyring por plataforma.
