
import { Router } from 'express';
import { pool } from '../db.js';
const router = Router();

const MAX_LIMIT = 100;

const encodeCursor = (cursor) => Buffer.from(JSON.stringify(cursor)).toString('base64url');

const decodeCursor = (cursor) => JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));

const parseLimit = (value) => {
 const requested = Number.parseInt(value ?? '20', 10);
 if (Number.isNaN(requested) || requested <= 0) return 20;
 return Math.min(requested, MAX_LIMIT);
};

router.get('/', async (req,res)=>{
 const limit = parseLimit(req.query.limit);
 const category = typeof req.query.category === 'string' && req.query.category.trim() ? req.query.category.trim() : null;
 const cursorToken = typeof req.query.cursor === 'string' && req.query.cursor.trim() ? req.query.cursor.trim() : null;

 let snapshot = new Date().toISOString();
 let cursorUpdated = null;
 let cursorId = null;

 if (cursorToken) {
   try {
     const cursor = decodeCursor(cursorToken);
     snapshot = cursor.snapshot;
     cursorUpdated = cursor.updatedAt;
     cursorId = cursor.id;

     if ((cursor.category ?? null) !== category) {
       return res.status(400).json({ error: 'Cursor category does not match the requested category.' });
     }
   } catch (error) {
     return res.status(400).json({ error: 'Invalid cursor.' });
   }
 }

 const params = [snapshot];
 let where = 'WHERE updated_at <= $1';
 if (category) {
   params.push(category);
   where += ` AND category = $${params.length}`;
 }
 if (cursorUpdated && cursorId) {
   params.push(cursorUpdated);
   params.push(cursorId);
   where += ` AND (updated_at,id) < ($${params.length - 1},$${params.length})`;
 }
 params.push(limit + 1);

 const q=`SELECT * FROM products ${where}
 ORDER BY updated_at DESC,id DESC
 LIMIT $${params.length}`;

 const {rows}=await pool.query(q,params);
 const hasMore = rows.length > limit;
 const pageItems = hasMore ? rows.slice(0, limit) : rows;
 const last = pageItems[pageItems.length - 1];

 res.json({
   snapshot,
   nextCursor: hasMore && last ? encodeCursor({
     snapshot,
     category,
     updatedAt: last.updated_at,
     id: last.id
   }) : null,
   hasMore,
   items:pageItems
 });
});
export default router;
