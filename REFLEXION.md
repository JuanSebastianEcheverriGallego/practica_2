# Reflexión técnica

**Práctica 2 · Despliegue de Software · API REST de productos (Node.js 20 + Express)**

## ¿Cómo abordaron el proceso de despliegue?
Como una cadena en la que cada etapa parte del resultado de la anterior, con una rama por integrante: API (`juan`), imagen Docker (`david`), manifiestos de Kubernetes (`jhon`) y, al final, documentación y reflexión. Primero validamos la API en Docker (`docker build`, `docker run -d -p 8080:3000`, `docker ps`, `docker logs` y peticiones POST/GET/DELETE a `/productos`). Después desplegamos esa misma imagen en el namespace `practica2` y la probamos por el NodePort `30080`. Para comprobar que el proceso se podía repetir, el Integrante 5 lo ejecutó completo en otro equipo, siguiendo solo el repositorio.

## ¿Qué errores encontraron y cómo los resolvieron?
- **Docker Desktop no se instalaba:** el equipo tenía Windows 10 versión 2004 (compilación 19041) y se necesita la 22H2 (compilación 19045). Lo solucionamos actualizando Windows desde Windows Update.
- **`kubectl` sin contexto:** Kubernetes no estaba habilitado en Docker Desktop (`current-context is not set`). En ese caso `kubectl` intenta conectarse a `localhost:8080`, el mismo puerto donde publicamos la API, y responde con un confuso `the server could not find the requested resource`. Habilitamos Kubernetes, seleccionamos el contexto `docker-desktop` y verificamos con `kubectl get nodes` que el nodo estuviera `Ready`.
- **Imagen local:** `practica2-api:v1` no está publicada en ningún registro, así que el clúster debe encontrarla en el Docker local. Por eso usamos una etiqueta fija con `imagePullPolicy: IfNotPresent` y comprobamos antes con `docker images` que la imagen existiera.
- **"Creado" no significa "funcionando":** además de `kubectl apply`, verificamos que el Pod estuviera `Running`, que el Deployment tuviera su réplica disponible y que la API respondiera en `localhost:30080`.
- **JSON en Windows PowerShell 5.1:** `curl.exe -d '{"nombre":"Lapiz",...}'` devolvía un error, porque PowerShell 5.1 quita las comillas internas antes de pasarlas a `curl.exe` y Express recibía un JSON inválido. Lo solucionamos escapando las comillas (`\"`) o usando `Invoke-RestMethod`.

## ¿Cómo se distribuyeron las responsabilidades del equipo?
| Integrante | Rol | Rama |
|---|---|---|
| 1 · Juan Sebastian Echeverri Gallego | Desarrollo de la API REST | `juan` |
| 2 · David Stiven Franco Lopez | Dockerfile, imagen y evidencias de Docker | `david` |
| 3 · Jhon Fernando Sanchez Alvarez | Manifiestos YAML, Kubernetes y evidencias | `jhon` |
| 4 · Marbel Juliana Mejia Bedoya | Repositorio y README | `marbel`|
| 5 · Marlon Garcia Sepulveda | Validación de principio a fin, reflexión y video | `marlon` |

## ¿Qué decisiones de la tecnología influyeron en el Dockerfile o en el despliegue?
- **`node:20-alpine`:** imagen base liviana. Copiamos `package*.json` antes que el código para aprovechar la caché de capas, y `npm install --omit=dev`, junto con el `package-lock.json`, fija las versiones y deja fuera las dependencias de desarrollo. El `.dockerignore` excluye `node_modules`, `k8s`, `evidencias`, `*.md` y `.git`.
- **Puertos:** Express escucha en el `3000`, que es el `EXPOSE`, el `containerPort` y el `targetPort`. Desde el equipo se accede por el `8080` (Docker) y por el `30080` (NodePort, dentro del rango 30000–32767).
- **Datos en memoria:** la API guarda los productos en un arreglo, así que con varias réplicas cada Pod tendría datos distintos y el Service repartiría las peticiones entre ellos. Por eso usamos `replicas: 1`, y aceptamos que si el Pod se reinicia los datos se pierden.
- **Recursos:** como Node.js funciona en un solo hilo y la API consume poco, fijamos requests de `100m`/`128Mi` y limits de `250m`/`256Mi`.
- **Pruebas:** la API no incluye Swagger, así que la verificamos con `curl` y Postman, lo que la práctica permite.
