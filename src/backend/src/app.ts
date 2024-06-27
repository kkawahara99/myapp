import express, { Application, Request, Response } from "express";
import cors from "cors";
import examRoutes from './routes/examRoutes';
import { errorHandler } from './utils/ErrorHandler';

const app: Application = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/exams', examRoutes);

app.use(errorHandler);

export default app;