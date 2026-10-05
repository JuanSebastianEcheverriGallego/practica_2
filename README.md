# Práctica 2 · Despliegue de Software

API REST de productos (CRUD básico en memoria) contenerizada con Docker y desplegada en Kubernetes local.

## Integrantes

- Juan Sebastian Echeverri Gallego
- David Stiven Franco Lopez
- Jhon Fernando Sanchez Alvarez
- Marbel Juliana Mejia Bedoya
- Marlon Garcia Sepulveda

## Tecnología

- Node.js 20 + Express
- Docker Desktop (con Kubernetes habilitado)
- Pruebas con Postman o `curl`

## Endpoints

| Método | Ruta             | Descripción                                                        |
| ------ | ---------------- | ------------------------------------------------------------------ |
| GET    | `/productos`     | Lista productos                                                    |
| GET    | `/productos/:id` | Obtiene un producto                                                |
| POST   | `/productos`     | Crea un producto. Body JSON: `{"nombre": "Lapiz", "precio": 1500}` |
| DELETE | `/productos/:id` | Elimina un producto                                                |

## Puertos

| Entorno               | Puerto host | Puerto contenedor |
| --------------------- | ----------- | ----------------- |
| Docker                | 8080        | 3000              |
| Kubernetes (NodePort) | 30080       | 3000              |

## Parte 1 · Docker

El `Dockerfile` usa `node:20-alpine`, instala solo dependencias de producción (`npm install --omit=dev`), copia `index.js` y expone el puerto 3000. El `.dockerignore` excluye `node_modules/`, `k8s/`, `evidencias/`, `*.md`, `*.pdf` y `.git/` para mantener la imagen liviana.

```bash
docker build -t practica2-api:v1 .
docker images
docker run -d -p 8080:3000 --name practica2-api practica2-api:v1
docker ps
```

Probar (PowerShell):

```powershell
curl.exe -X POST http://localhost:8080/productos -H "Content-Type: application/json" -d '{"nombre":"Lapiz","precio":1500}'
curl.exe http://localhost:8080/productos
curl.exe http://localhost:8080/productos/1
curl.exe -X DELETE http://localhost:8080/productos/1
```

Probar (bash/Linux/macOS):

```bash
curl -X POST http://localhost:8080/productos -H "Content-Type: application/json" -d '{"nombre":"Lapiz","precio":1500}'
curl http://localhost:8080/productos
curl http://localhost:8080/productos/1
curl -X DELETE http://localhost:8080/productos/1
```

Eliminar el contenedor:

```bash
docker rm -f practica2-api
```

## Parte 2 · Kubernetes

Requiere Kubernetes habilitado en Docker Desktop (Settings → Kubernetes → Enable Kubernetes). Usa la imagen local `practica2-api:v1` construida en la parte 1.

Manifiestos en `k8s/`:

- `namespace.yaml`: namespace `practica2`.
- `deployment.yaml`: 1 réplica de `practica2-api:v1`, con `requests` y `limits` de CPU/memoria.
- `service.yaml`: Service tipo `NodePort` (30080 → 3000).

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get pods -n practica2
kubectl get svc -n practica2
```

Probar (PowerShell):

```powershell
curl.exe -X POST http://localhost:30080/productos -H "Content-Type: application/json" -d '{"nombre":"Lapiz","precio":1500}'
curl.exe http://localhost:30080/productos
curl.exe http://localhost:30080/productos/1
curl.exe -X DELETE http://localhost:30080/productos/1
```

Probar (bash/Linux/macOS):

```bash
curl -X POST http://localhost:30080/productos -H "Content-Type: application/json" -d '{"nombre":"Lapiz","precio":1500}'
curl http://localhost:30080/productos
curl http://localhost:30080/productos/1
curl -X DELETE http://localhost:30080/productos/1
```

Alternativa con port-forward: `kubectl port-forward svc/practica2-api 8081:3000 -n practica2` y usar `http://localhost:8081`.

Eliminar todo: `kubectl delete namespace practica2`

## Buenas prácticas aplicadas

- Namespace propio `practica2`.
- `requests` (100m CPU / 128Mi) y `limits` (250m CPU / 256Mi) en el contenedor.
- Imagen versionada `practica2-api:v1` con `imagePullPolicy: IfNotPresent`.
- Imagen base ligera (`node:20-alpine`) y solo dependencias de producción.
- `.dockerignore` para excluir archivos innecesarios del contexto de build.

## Evidencias

### Docker

| Evidencia                                 | Captura                                                       |
| ----------------------------------------- | ------------------------------------------------------------- |
| Contenedor ejecutándose en Docker Desktop | ![](evidencias/david-docker-01-contenedor-docker-desktop.png) |
| Imagen generada (Docker Desktop)          | ![](evidencias/david-docker-02-imagen-docker-desktop.png)     |
| `docker images` / `docker ps`             | ![](evidencias/david-docker-03-terminal-images-ps.png)        |
| Acceso funcional a la API (puerto 8080)   | ![](evidencias/david-docker-04-api-funcionando.png)           |

### Kubernetes

| Evidencia                                  | Captura                                                |
| ------------------------------------------ | ------------------------------------------------------ |
| `kubectl get pods -n practica2`            | ![](evidencias/jhon-k8s-01-get-pods.png)               |
| `kubectl get svc -n practica2`             | ![](evidencias/jhon-k8s-02-get-svc.png)                |
| Acceso funcional a la API (NodePort 30080) | ![](evidencias/jhon-k8s-03-api-funcionando.png)        |
| `deployment.yaml`                          | ![](evidencias/jhon-k8s-04-deployment-yaml.png)        |
| `namespace.yaml` y `service.yaml`          | ![](evidencias/jhon-k8s-05-namespace-service-yaml.png) |

## Video

Enlace al video de la práctica: [Ver video de la práctica](https://drive.google.com/file/d/1OC4XN2qYiQmNGTyradBD4llk4w5Jm010/view?usp=drive_link)

## Estructura

```
index.js            Código de la API
package.json        Dependencias
package-lock.json   Versiones exactas de dependencias
Dockerfile          Construcción de la imagen
.dockerignore       Archivos excluidos del build
k8s/                Manifiestos (namespace, deployment, service)
evidencias/         Capturas de pantalla
```
