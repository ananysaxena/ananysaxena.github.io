# Premium Monochrome WebGL 3D Artist Portfolio

An ultra-premium, interactive 3D Generalist portfolio website custom-built for **Anany Saxena**. Inspired by high-end creative agency layouts (DogStudio), it features a center-aligned overlapping Hero layout, a dynamic Three.js WebGL canvas, and an ArtStation-style **Lookdev Studio** with interactive slideshow maps and real-time **Marmoset Toolbag Viewer** embeds.

Fully static, optimized in `.webp` formats, and 100% ready for hosting on **GitHub Pages**!

---

## 🌟 Visual & Interactive Features

* **Monochrome Art Gallery Vibe:** Designed strictly in high-contrast Black & White, utilising a deep obsidian black theme and a soft alabaster light theme (default).
* **WebGL 3D Core Viewport:** Three.js-powered canvas in the background that rotates and morphs dynamically based on page scrolls and mouse coordinate tracking.
* **Lookdev Studio Modal Drawer:** Dynamic project cards that open full-screen lookdev viewport overlays where visitors can cross-fade between render passes (Render, Wireframe, Ambient Occlusion, Albedo Map, Normals).
* **Marmoset Toolbag Viewport Embeds:** Full WebGL Marmoset Viewer integration (`.mview` scenes) allowing recruiters to inspect your meshes and textures in 3D right on the page.
* **Relocated CV CV Card:** Premium Resume Download button relocated inside the Contact details card.
* **Functional Email Form:** Fully connected to **FormSubmit** for routing form submissions directly to `saxena12anany@outlook.com` automatically!

---

## 📂 Project Folder Structure

To add new projects dynamically without changing a single line of HTML/JS, simply drop a folder under `projects/` (e.g. `projects/cyberpunk-drone/`) containing:
* `info.json` -> Project metadata (title, category, tools, description, walk-through link).
* `thumbnail.webp` (or `.jpg`) -> Card preview image.
* `model.glb` *(Optional)* -> 3D model.
* `model.mview` *(Optional)* -> Marmoset Toolbag scene.
* Lookdev WebP layers: `render.webp`, `wireframe.webp`, `ao.webp`, `basecolor.webp`, `normals.webp`.

---

## 🚀 How to Run Locally with Auto-Sync

We have built a custom **Auto-Sync Dev Server (`server.py`)** in Python. When running, the server intercepts your page refreshes at `localhost:8000`, **automatically scans your `projects/` directories in the background, and rebuilds the database (`projects.json`) in real-time**!

### 1. Start the Auto-Sync Server
Run this command in your terminal:
```bash
python server.py
```

### 2. View the Website
Open your browser and navigate to:
**`http://localhost:8000`**

*Whenever you add, delete, or rename project folders, simply hit **Refresh** in your browser, and the dev server will automatically synchronize and render your changes instantly!*

---

## 🌐 Deploying to GitHub Pages (Free Hosting)

1. Create a new repository on GitHub named `ananysaxena.github.io` (replace `ananysaxena` with your exact GitHub username).
2. Upload all the files from this directory to the repository.
3. In your GitHub repository, go to **Settings** -> **Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Set the Branch to **`main`** (or `master`) and folder to **`/ (root)`**, then click **Save**.
6. Within a minute, your portfolio will be live at: **`https://yourusername.github.io/`**!
