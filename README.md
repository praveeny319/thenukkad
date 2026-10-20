# The Nukkad 

India's social commerce platform for home sellers 
and local businesses.

**Live:** https://thenukkad.store

## What is Nukkad?

Nukkad gives any business a beautiful online store 
profile — like an socia media page but built for 
selling. No website needed. No developer needed. 
Online in 5 minutes, free.
The online store can be accessible only through 
the link provided by the store owner. 

## Stack

- Frontend: Vanilla HTML, CSS, JavaScript
- Backend: Supabase (Database, Auth, Storage)
- Hosting: GitHub Pages
- Domain: thenukkad.store

## Project structure

- `index.html` is the site entry point.
- `src/pages/` contains the individual page sections.
- `src/components/` contains shared navigation, overlays, and UI components.
- `src/styles/style.css` contains the site styles.
- `src/load-fragments.js` loads the HTML fragments; `src/app.js` contains the app logic.

The page fragments are loaded with `fetch`, so run the site through a local web
server rather than opening `index.html` directly from the filesystem.

## Features

- Store profile with animated cover wall
- Product catalog with photo upload
- WhatsApp-native ordering
- Seller dashboard with order management
- Analytics — orders, revenue, top products
- QR code and Instagram story card generator
- Admin panel
- Buyer flow with localStorage

## Built by

Praveen Yadav 
