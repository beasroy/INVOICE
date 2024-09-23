import express from "express";
import { createInvoice, getAllInvoices, getInvoice } from "../controller/invoice.js";

const router = express.Router();

router.post("/create", createInvoice);
router.get("/all",getAllInvoices);
router.get("/:id",getInvoice);

export default router;

