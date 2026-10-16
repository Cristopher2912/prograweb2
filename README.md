# Rick and Morty - Catálogo de Personajes

Copia del proyecto TechStore con el mismo frontend, pero consumiendo la API pública de
[Rick and Morty](https://rickandmortyapi.com/api/character) en lugar del backend propio.

## Frontend (`frontend/`)

* Vite + Bootstrap 5 + Tailwind CSS v3 + CSS Grid, Flexbox y Media Queries.
* Grid responsive: 1 columna (móvil), 3 columnas (normal) y 4 columnas (pantalla grande).
* Buscador en tiempo real por nombre (consulta la API con `?name=`).
* Filtro por estado (vivo / muerto / desconocido) y paginación.
* Pop-up con la información completa del personaje al hacer clic en una tarjeta.

```bash
cd frontend
npm install
npm run dev
```

Disponible en `http://localhost:5174/`.

