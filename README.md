# 📚 My bookshelf — Notion Reading Tracker Prototype

A reading tracker prototype powered by the latest **Notion API (`2026-03-11`)** and Notion's **Data Sources** architecture. Displays books in an interactive gallery format with rich properties, live search, genre filtering, star ratings, and review modals.

---

## ✨ Features

- **Gallery Format**: Visual card grid showing book covers (with 3D spine shadow effect), titles, authors, Notion genre tags, star ratings, and review quotes.
- **Latest Notion API Integration (`2026-03-11`)**:
  - Implements Notion's Data Sources architecture (`/v1/databases/{id}` -> `/v1/data_sources/{data_source_id}/query`).
  - Supports automatic fallback to legacy endpoints for older Notion databases.
  - Safe backend proxy to prevent browser CORS limitations and protect API secrets.
- **Database Schema Support**:
  1. `Title`: Notion `title` property.
  2. `Author`: Notion `rich_text`, `select`, or `people` property.
  3. `Genre`: Single select (`select`) property with Notion badge coloring.
  4. `Cover Image`: Notion `files` property or Notion page `cover`.
  5. `Rating`: Notion `number` property rendered as interactive stars and score badges.
  6. `Review`: Notion `rich_text` property rendered as expandable quotes and full review modals.
- **Interactive Tools**:
  - Live fuzzy search by title, author, genre, or review text.
  - Genre filter pills with book counts.
  - Star rating filter (All, 5-star, 4+, 3+).
  - Multi-criteria sorting (Rating: High to Low, Rating: Low to High, Title: A-Z, Recently Added).
  - Detailed Reading Modal with full book review, rating, and Notion page link.
  - In-App Book Adder (`+ Add Book`) that writes directly to the Notion database.
  - In-App Notion Connection Manager with diagnostic property validation and instant **Demo Mode** toggle.

---

## 🚀 Quick Start

### 1. Run Development Server
```bash
cd /Users/wangruyi/.gemini/antigravity/scratch/my-bookshelf
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> [!TIP]
> The prototype opens in **Demo Mode** by default with sample books, allowing you to explore the gallery immediately before setting up Notion.

---

## ⚙️ Connecting to your Notion Database

You can enter your credentials directly in the **"Notion Setup"** modal inside the web interface (stored securely in your local browser), or set them via `.env` file:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Create an Internal Integration at [notion.so/profile/integrations](https://www.notion.so/profile/integrations):
   - Name: `My Bookshelf`
   - Copy the secret token (starts with `ntn_...` or `secret_...`).
3. Connect your Notion Database:
   - Open your reading database in Notion.
   - Click the `•••` (More) menu in the top-right corner.
   - Click **Connections** -> Select **My Bookshelf**.
4. Copy the Database ID from the database URL:
   ```
   https://www.notion.so/myworkspace/a8aec43acf324976a5a3e40103e1b66?v=...
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                             Database ID
   ```
5. Click **"Notion Setup"** in the app header and click **"Test & Validate Database"** to verify that all 6 required properties are present!
