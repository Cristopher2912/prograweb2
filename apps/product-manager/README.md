# Product Manager

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4-6DB33F?logo=springboot&logoColor=white)
![H2](https://img.shields.io/badge/H2-Database-blue)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

A full-stack product catalog with a Spring Boot REST API backend and a vanilla
JavaScript frontend. Supports full CRUD, real-time search, and a responsive grid layout.

Part of the [Web Apps Monorepo](../../README.md).

## Table of contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation and setup](#installation-and-setup)
- [API reference](#api-reference)
- [Project structure](#project-structure)

## Architecture

Client-server architecture: a Spring Boot REST API backed by an in-memory H2
database, consumed by a Vite frontend.

## Features

- **Full CRUD**: create, read, update and delete products through the API.
- **Real-time search**: instant filtering by name, ID or price as the user types.
- **Interactive detail modal**: clicking a product card opens a modal with full
  details, a visual stock level indicator, and edit/delete actions.
- **Responsive design**: 1 column on mobile (< 768px), 3 columns on tablet
  (768px–1199px), 4 columns on large screens (>= 1200px).

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 4, Spring Data JPA |
| Database | H2 (in-memory) |
| Frontend | Vite, Vanilla JavaScript, Bootstrap 5, Tailwind CSS |

## Prerequisites

- [Java 17](https://adoptium.net/) or newer
- [Node.js 20+](https://nodejs.org/) and npm

## Installation and setup

### 1. Start the backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080/api/products`.
The H2 web console is available at `http://localhost:8080/h2-console`
(JDBC URL: `jdbc:h2:mem:arquidb`, user: `sa`, no password).

### 2. Start the frontend (Vite)

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The web app will be available at `http://localhost:5173/`.

### 3. Build for production

```bash
cd frontend
npm run build
```

## API reference

Base URL: `/api/products`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/{id}` | Get a single product by ID |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/{id}` | Update an existing product |
| `DELETE` | `/api/products/{id}` | Delete a product |

**Example request body** (`POST` / `PUT`):

```json
{
  "name": "Wireless Mouse",
  "price": 25.5,
  "stock": 40
}
```

## Project structure

```text
├── backend/                  # Spring Boot REST API server
│   ├── src/main/java/        # Controllers, JPA entities, repositories, seeder
│   ├── src/main/resources/   # application.properties (port 8080, H2 console)
│   ├── mvnw / mvnw.cmd       # Maven Wrapper
│   └── pom.xml               # Backend dependencies
│
├── frontend/                 # Vite client application
│   ├── public/assets/        # Product images
│   ├── css/styles.css        # Media queries, Grid and Flexbox layout
│   ├── js/app.js             # API consumption, real-time search and detail modal
│   ├── index.html            # Application entry point
│   └── package.json          # Run scripts (npm run dev / build)
│
└── .gitignore
```
