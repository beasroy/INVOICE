import express from "express";
import { createInvoice, getInvoice } from "../controller/invoice.js";

const router = express.Router();

router.post("/create", createInvoice);
router.get("/:id",getInvoice)

export default router;

