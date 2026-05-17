# 📚 Bookshelf App

A simple web application to manage your personal book collection — add, edit, search, and organize books you've finished reading, all automatically saved in your browser.

<p align="center">
 <img width="1894" height="928" alt="bookshelf-app" src="https://github.com/user-attachments/assets/922728e0-4392-4056-b8f1-0143a07b85f1" />
</p>

---

## ✨ Features

- **Add Books** — enter title, author, publication year, and optional book cover
- **Cover Upload** — upload images directly from your device; if no image is provided, the app displays the book title initial as a placeholder
- **Automatic Shelves** — books are grouped into *Unread* and *Completed* sections
- **Reading Status Toggle** — move books between shelves with a single click
- **Edit & Delete** — update book information anytime or remove books you no longer need
- **Book Search** — quickly filter books by title
- **Data Persistence** — all data is stored in `localStorage`, so it remains available even after refreshing the page

---

## 🗂️ File Structure

```bash
bookshelf-app/
├── index.html   # Page structure & UI elements
├── style.css    # Styling & responsive layout
└── main.js      # Application logic (CRUD, rendering, storage)
```

---

## 🚀 Getting Started

No installation required. Simply open `index.html` in your browser.

```bash
# Or use Live Server in VS Code for the best development experience
```

---

## 🛠️ Technologies

- **HTML5, CSS3, JavaScript** (Vanilla — no framework)
- :contentReference[oaicite:0]{index=0} — interface icons
- **localStorage** — client-side data storage

---

## 📸 Interface Overview

| Section | Description |
|---|---|
| Header | Application logo & title |
| Left Form | Add / edit book form |
| Right Form | Book search |
| Bottom Shelves | Unread & completed book lists |

---

> Built as a front-end web development practice project. 🎓
