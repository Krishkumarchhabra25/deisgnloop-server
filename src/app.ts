import express, { Request, Response } from 'express';
import cors from "cors"
import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req:Request, res:Response) => {
  res.send('Welcome to DevOps Server');
});

app.use("/api/v1/", routes);


export default app;
