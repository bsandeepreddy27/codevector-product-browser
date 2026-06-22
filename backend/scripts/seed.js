
import { pool } from '../src/db.js';

await pool.query('DROP TABLE IF EXISTS products;');

await pool.query(`
CREATE TABLE IF NOT EXISTS products(
 id BIGSERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 category TEXT NOT NULL,
 price NUMERIC(10,2),
 created_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL
)`);

await pool.query(`
CREATE INDEX IF NOT EXISTS idx_products_updated_id
ON products(updated_at DESC,id DESC)`);

await pool.query(`
CREATE INDEX IF NOT EXISTS idx_products_category_updated_id
ON products(category,updated_at DESC,id DESC)`);

await pool.query(`
WITH base AS (
 SELECT
	 'Product ' || gs AS name,
	 (ARRAY['Electronics','Books','Fashion','Sports'])[(floor(random() * 4) + 1)::int] AS category,
	 round((random() * 10000)::numeric, 2) AS price,
	 NOW() - (random() * interval '365 days') AS created_at
 FROM generate_series(1, 200000) gs
)
INSERT INTO products(name,category,price,created_at,updated_at)
SELECT
 name,
 category,
 price,
 created_at,
 LEAST(created_at + (random() * interval '90 days'), NOW())
FROM base;
`);

console.log('Seeded 200k products');
process.exit(0);
