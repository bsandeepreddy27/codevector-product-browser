
import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/products', productsRouter);
app.get('/', (_,res)=>res.json({message:'Product Browser API'}));

const port = Number(process.env.PORT) || 5000;
const server = app.listen(port, ()=>{
	console.log(`Product Browser API listening on port ${port}`);
});

server.on('error', (error) => {
	if (error.code === 'EADDRINUSE') {
		console.error(`Port ${port} is already in use. Set PORT to another value and start again.`);
		process.exitCode = 1;
		return;
	}

	console.error(error);
	process.exitCode = 1;
});
