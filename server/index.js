import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import invoiceRoutes from "./routes/invoice.js";

const app = express();
dotenv.config();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/invoice", invoiceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
