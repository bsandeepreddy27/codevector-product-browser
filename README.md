
# CodeVector Product Browser

Small product browser built with Node.js, Express, PostgreSQL, and a React/Vite frontend.

It is designed around two requirements:

1. Pagination must stay fast on a large dataset.
2. Browsing must stay consistent if new products are added or updated while the user is paging.

## What I chose and why

- PostgreSQL: good fit for 200k rows, composite indexes, and stable keyset pagination.
- Keyset pagination: faster and more stable than offset pagination for large datasets.
- Opaque cursor: the API returns one cursor token per page so the client does not need to manage raw sort fields.
- Snapshot timestamp: every browsing session keeps a fixed cutoff so the user does not see duplicates or miss rows while data changes.

## Project Structure

- `backend/` contains the API, schema seed script, and PostgreSQL connection.
- `frontend/` contains the optional React UI.

## Backend Behavior

The backend exposes `GET /products` with these query parameters:

- `limit` - number of items to return, capped at 100.
- `category` - optional category filter.
- `cursor` - opaque token returned by the previous page.

Each response returns:

- `items` - the current page of products.
- `nextCursor` - token for the next page, or `null` if there are no more rows.
- `hasMore` - boolean that tells the UI whether to show a load-more button.
- `snapshot` - the timestamp used to freeze the browsing session.

## Local Setup

### 1. Create the database

Create a PostgreSQL database in Neon, then copy `backend/.env.example` to `backend/.env` and replace the placeholder `DATABASE_URL` value with your Neon connection string.

Example:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
PORT=5000
```

### 2. Install dependencies

From the repository root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Seed the database

From `backend/`:

```bash
npm run seed
```

This drops and recreates `products`, then inserts 200,000 rows in one set-based query and adds the indexes used by the API.

### 4. Start the backend

From `backend/`:

```bash
npm start
```

If port `5000` is already in use, set a different `PORT` value before starting.

### 5. Start the frontend

From `frontend/`:

```bash
npm run dev
```

If the backend is hosted elsewhere, set `VITE_API_BASE_URL` in `frontend/.env`.

To do that, copy `frontend/.env.example` to `frontend/.env` and change the value to your backend URL.

## How to Use It

Open the frontend, choose a category, and click Load More to page through the dataset.

The browsing session is stable because the API uses:

- `ORDER BY updated_at DESC, id DESC`
- a cursor that stores the last seen sort key
- a snapshot cutoff so new writes do not reshuffle the current session

## Push to GitHub

This repository is a single Git repo with two app folders, so you push the root folder once. If it is not already on GitHub:

```bash
git status
git add .
git commit -m "Build stable product browser"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If the remote already exists, skip `git remote add origin` and just push your branch.

If you want a cleaner first push, make sure `.gitignore` is in the repository root so local installs and secret files do not get committed.

## Deploy on Render and Neon

Use Neon for PostgreSQL and Render for the apps.

### Neon database

1. Create a Neon project and a database.
2. Copy the connection string from the Neon dashboard.
3. Use that connection string in `backend/.env` for local development.
4. Use the same connection string as `DATABASE_URL` in Render for production.
5. Seed the database once with `npm run seed` from `backend/` after the database is ready.

### Render backend

1. Create a new Web Service on Render and connect your GitHub repo.
2. Set the root directory to `backend`.
3. Use these settings:
	- Build command: `npm install`
	- Start command: `npm start`
4. Add environment variables:
	- `DATABASE_URL` = your Neon connection string
	- `PORT` = Render sets this automatically for web services
5. Deploy.

If you change code later, push to GitHub and Render will redeploy from the selected branch.

### Render frontend

1. Create a second Render service for the frontend, this time as a Static Site.
2. Set the root directory to `frontend`.
3. Use these settings:
	- Build command: `npm install && npm run build`
	- Publish directory: `dist`
4. Add an environment variable:
	- `VITE_API_BASE_URL` = the public URL of your Render backend
5. Deploy.

If you prefer to test locally first, run the backend on one terminal and the frontend on another.

### Local frontend run

From `frontend/`:

```bash
npm install
npm run dev
```

If the backend is running on a different URL, create `frontend/.env` with `VITE_API_BASE_URL=http://localhost:5000` or your deployed backend URL.

You can also start from `frontend/.env.example` and edit the value.

## Notes

- The frontend is optional. The core of the assessment is the backend and the pagination behavior.
- The backend now logs a clear message if the chosen port is already occupied.
- The seed script is intentionally set-based rather than row-by-row so it stays fast.

## AI Use

AI helped draft the React UI, the deployment notes, and the README structure. I also used it to speed up the first pass on the keyset pagination implementation, then validated and corrected the details in the actual code and seed script.
