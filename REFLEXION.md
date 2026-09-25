# Reflexión técnica

## ¿Cómo abordaron el proceso de despliegue?
_Completar._

## ¿Qué errores encontraron y cómo los resolvieron?
_Completar._

## ¿Cómo se distribuyeron las responsabilidades del equipo?
_Completar._

## ¿Qué decisiones de la tecnología influyeron en el Dockerfile o el despliegue?
- Se usó `node:20-alpine` por ser una imagen liviana.
- Se copia primero `package.json` e instalan dependencias antes del código para aprovechar la caché de capas.
- `npm install --omit=dev` evita instalar dependencias de desarrollo en la imagen.
- `.dockerignore` excluye `node_modules` para que las dependencias se instalen dentro de la imagen.
