# Programacion Web — Monorepo

**Author:** Cristopher Alquinga — Web Programming (UCE)

This repository hosts three independent web applications under a single monorepo,
following a professional Git/CI/CD workflow (Jira + GitHub Actions + AWS EC2).

## Applications

| App | Path | Stack | Description |
|---|---|---|---|
| **Product Manager** | [`apps/product-manager`](apps/product-manager) | Spring Boot 4 + Java 17 + H2 + JPA / Vite | Full CRUD product catalog consuming a self-hosted REST API |
| **Rick and Morty Catalog** | [`apps/rick-and-morty`](apps/rick-and-morty) | Vite (vanilla JS) | Character catalog consuming the public Rick and Morty API |
| **Pokedex** | [`apps/pokedex`](apps/pokedex) | Vite (vanilla JS) | Pokemon catalog consuming the public PokeAPI *(coming soon)* |

Each app keeps its own README with setup and run instructions.

## Repository structure

```text
.
├── apps/
│   ├── product-manager/
│   │   ├── backend/        # Spring Boot REST API (H2 in-memory database)
│   │   └── frontend/       # Vite client (Bootstrap + Tailwind)
│   ├── rick-and-morty/
│   │   └── frontend/       # Vite client
│   └── pokedex/            # Coming soon
├── home/                   # Landing page linking to each app (coming soon)
├── .github/
│   ├── CODEOWNERS
│   └── workflows/          # CI/CD pipelines (coming soon)
└── README.md
```

## Branching strategy

```
feature/PW-xx  →  dev  →  test  →  main
```

- `feature/PW-xx-*`: one branch per Jira task, branched from `dev`.
- `dev`: integration branch, deployed to the **development** environment.
- `test`: QA branch, deployed to the **testing** environment.
- `main`: production branch, deployed to the **production** environment. Every pull request into `main` requires review from the repository's Code Owners.

Every branch, commit and pull request is linked to a Jira task (`PW-xx`) for full traceability.

## Getting started

See each application's own README under `apps/` for local setup instructions.
