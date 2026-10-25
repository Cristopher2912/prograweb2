# Rick and Morty Catalog

![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![API](https://img.shields.io/badge/API-Rick%20and%20Morty-00C300)

A catalog frontend consuming three resources of the public
[Rick and Morty API](https://rickandmortyapi.com/): Characters, Locations and
Episodes. Vanilla JavaScript, no backend of its own — all data comes from the
external REST API.

Part of the [Web Apps Monorepo](../../README.md).

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation and setup](#installation-and-setup)
- [External API reference](#external-api-reference)
- [Project structure](#project-structure)

## Features

- **Three resource tabs**: switch between Characters, Locations and Episodes.
- **Real-time search**: search by name, querying the API with `?name=`.
- **Filter by status** (Characters only): alive / dead / unknown.
- **Pagination**: browse through the full list of each resource.
- **Detail pop-up**: clicking a card opens its full information, tailored to each resource type.
- **Responsive design**: 1 column on mobile, 3 columns on tablet, 4 columns on large screens.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vite, Vanilla JavaScript, Bootstrap 5, Tailwind CSS |
| Data source | [Rick and Morty public REST API](https://rickandmortyapi.com/documentation) |

## Prerequisites

- [Node.js 20+](https://nodejs.org/) and npm

## Installation and setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5174/`.

### Build for production

```bash
npm run build
```

## External API reference

This app consumes the public Rick and Morty API (no authentication required):

| Resource | Endpoint | Used for |
|---|---|---|
| Characters | `GET https://rickandmortyapi.com/api/character` | Characters tab: catalog, search and status filter |
| Locations | `GET https://rickandmortyapi.com/api/location` | Locations tab: catalog and search |
| Episodes | `GET https://rickandmortyapi.com/api/episode` | Episodes tab: catalog and search |

## Project structure

```text
frontend/
├── css/styles.css   # Media queries, Grid and Flexbox layout
├── js/app.js        # API consumption, UI logic, state and rendering
├── index.html       # Application entry point
└── package.json     # Run scripts (npm run dev / build)
```
