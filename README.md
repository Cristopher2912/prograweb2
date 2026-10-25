# Web Apps Monorepo

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4-6DB33F?logo=springboot&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

**Author:** Cristopher Alquinga — Web Programming (UCE)

A monorepo hosting multiple independent web applications, built and shipped with a
professional software delivery workflow: **Jira** for task tracking, **GitHub Flow**
for branching, **GitHub Actions** for CI/CD, and **AWS EC2** for hosting.

## Table of contents

- [Applications](#applications)
- [Repository structure](#repository-structure)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Branching strategy](#branching-strategy)
- [CI/CD](#cicd)
- [Project management](#project-management)

## Applications

| App | Path | Description |
|---|---|---|
| **Product Manager** | [`apps/product-manager`](apps/product-manager) | Full CRUD product catalog with a Spring Boot REST API and an H2 in-memory database |
| **Rick and Morty Catalog** | [`apps/rick-and-morty`](apps/rick-and-morty) | Character catalog consuming the public [Rick and Morty API](https://rickandmortyapi.com/) |

Each application has its own README with detailed setup and usage instructions.

## Repository structure

```text
.
├── apps/
│   ├── product-manager/
│   │   ├── backend/        # Spring Boot REST API (H2 in-memory database)
│   │   └── frontend/       # Vite client (Bootstrap + Tailwind)
│   └── rick-and-morty/
│       └── frontend/       # Vite client consuming an external public API
├── home/                   # Landing page linking to each app
├── .github/
│   └── workflows/          # CI/CD pipelines (GitHub Actions)
└── README.md
```

## Tech stack

- **Backend:** Java 17, Spring Boot 4, Spring Data JPA, H2 Database
- **Frontend:** Vite, Vanilla JavaScript, Bootstrap 5, Tailwind CSS
- **CI/CD:** GitHub Actions
- **Project management:** Jira (linked to GitHub via smart commits and branch automation)
- **Hosting:** AWS EC2 (Nginx + systemd)

## Prerequisites

- [Java 17](https://adoptium.net/) (or newer)
- [Node.js 20+](https://nodejs.org/) and npm
- Git

No local Maven or npm global install is required — each app ships its own wrapper
(`mvnw` / `mvnw.cmd`) and uses the project's local `node_modules`.

## Getting started

Clone the repository and start any app independently. Example for Product Manager:

```bash
git clone https://github.com/Cristopher2912/prograweb2.git
cd prograweb2

# Backend
cd apps/product-manager/backend
./mvnw spring-boot:run

# Frontend (in a separate terminal)
cd apps/product-manager/frontend
npm install
npm run dev
```

See each app's own README for its specific run instructions and available scripts:

- [Product Manager — README](apps/product-manager/README.md)
- [Rick and Morty Catalog — README](apps/rick-and-morty/README.md)

## Branching strategy

```
feature/PW-xx  →  dev  →  test  →  main
```

- `feature/PW-xx-*` — one branch per Jira task, branched from `dev`.
- `dev` — integration branch, deployed to the **development** environment.
- `test` — QA branch, deployed to the **testing** environment.
- `main` — production branch, deployed to the **production** environment. Every pull
  request into `main` requires manual review approval before merging.

Every branch, commit and pull request is linked to a Jira task (`PW-xx`) for full traceability.

## CI/CD

GitHub Actions runs on every pull request:

- **CI** (`.github/workflows/ci.yml`): builds and tests the backend (`./mvnw verify`)
  and builds every frontend app (`npm ci && npm run build`). A pull request cannot be
  merged unless all checks pass.
- **CD** *(in progress)*: automated deployment to the `testing` and `production`
  environments on AWS EC2 via SSH, gated by GitHub Environments.

## Project management

All work is tracked in Jira under the `PW` project and linked to this repository.
Each task follows the flow: **To Do → In Progress (branch created) → In Review
(pull request opened) → Done (pull request merged)**.
