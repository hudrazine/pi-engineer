import assert from "node:assert/strict";
import { invoiceTotal } from "./src/invoice.js";

assert.equal(invoiceTotal([{ price: 10 }, { price: 5 }], 0.1), 16.5);
