
# Microbe of the Day

A React + Vite mini app that highlights one microbe card at a time with scientific name, key fact, themed styling, and next/previous navigation.

## Features

- Randomized first card on load
- Single-card browsing with Previous and Next Microbe controls
- Species-themed card accents and scale marker
- Optimized local WebP images for fast loading
- Custom browser tab icon

## Microbes Included

- Deinococcus radiodurans
- Vibrio fischeri
- Halobacterium salinarum

## Tech Stack

- React
- Vite
- CSS

## Run Locally

1. Install dependencies

	npm install

2. Start development server

	npm run dev

3. Build for production

	npm run build

## Project Structure

- src/App.jsx: app state and microbe data
- src/components/MicrobeCard.jsx: reusable card UI
- src/App.css: layout and component styling
- src/assets/images: local microbe images
- public/microbe.svg: favicon

## Image Workflow

Use WebP assets in src/assets/images.

Current expected filenames:

- Deinococcus-radiodurans.webp
- Vibrio-fischeri.webp
- Halobacterium-salinarum.webp

Recommendations:

- Keep width around 1200px for cards
- Prefer compressed WebP for performance
- If filenames change, update imports in src/App.jsx
