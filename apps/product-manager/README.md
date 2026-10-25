# Sistema de Gestión de Productos 
# Cristopher Alquinga - Programación WEB


Proyecto web completo desarrollado con arquitectura cliente-servidor.

## 🚀 Arquitectura del Proyecto

* **Backend**: Spring Boot 4 / Java 17+, Base de datos en memoria H2, Spring Data JPA y API REST (`/api/products`).
* **Frontend**: Vanilla JavaScript + Vite, Bootstrap 5, Tailwind CSS v3, CSS Grid, Flexbox y Media Queries.

---

## 📁 Estructura del Repositorio

```text
├── backend/                  # Servidor API REST en Spring Boot
│   ├── src/main/java/        # Controladores, Entidades JPA, Repositorios, Seeder
│   ├── src/main/resources/   # application.properties (puerto 8080, H2 console)
│   ├── mvnw / mvnw.cmd       # Maven Wrapper
│   └── pom.xml               # Dependencias del backend
│
├── frontend/                 # Aplicación Cliente con Vite
│   ├── public/assets/        # Imágenes de productos (Laptop, Mouse, Teclado)
│   ├── css/styles.css        # Media Queries (1, 3 y 4 columnas), Grid y Flexbox
│   ├── js/app.js             # Consumo de API, Buscador en tiempo real y Pop-up Modal
│   ├── index.html            # Interfaz de usuario limpia
│   └── package.json          # Scripts de ejecución (npm run dev)
│
└── .gitignore                # Reglas de exclusión para Node y Java
```

---

## 💻 Características del Frontend

1. **Responsive Design con Media Queries**:
   * **Móvil (< 768px)**: 1 columna de productos.
   * **Normal / Tablet (768px a 1199px)**: 3 columnas de productos.
   * **Pantallas grandes (>= 1200px)**: 4 columnas de productos.
2. **Buscador en Tiempo Real**: Filtrado instantáneo por nombre, ID o precio conforme el usuario escribe.
3. **Pop-up Modal Interactivo**: Al hacer clic en cualquier tarjeta se abre un modal con información detallada, barra visual de nivel de stock y acciones de edición/eliminación.
4. **CRUD Completo con la API**: Operaciones `GET`, `POST`, `PUT` y `DELETE` sincronizadas con Spring Boot.

---

## 🛠️ Instrucciones de Ejecución

### 1. Iniciar el Backend (Spring Boot)
Abre una terminal y ejecuta:
```bash
cd backend
./mvnw spring-boot:run
```
> El servidor estará disponible en `http://localhost:8080/api/products` (Consola H2 en `http://localhost:8080/h2-console`).

### 2. Iniciar el Frontend (Vite)
Abre otra terminal y ejecuta:
```bash
cd frontend
npm install
npm run dev
```
> La aplicación web estará disponible en `http://localhost:5173/`.
