import express, { Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import cookieParser from 'cookie-parser'
const app = express();


//Parsers
app.use(express.json());
app.use(cors());
app.use(cookieParser())

//application routers
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  // Promise.reject();
  const a = 10;
  res.send(`${a}`);
});

// Global error handler middleware
app.use(globalErrorHandler);

// api not found route
app.use(notFound);

export default app;
