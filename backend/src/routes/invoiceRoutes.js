const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');

router.route('/')
    .get(getInvoices)
    .post(createInvoice);

router.route('/:id')
    .put(updateInvoice)
    .delete(deleteInvoice);

module.exports = router;