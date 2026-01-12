const express = require("express");
const router = express.Router();

const { metricsSummary } = require('./../controllers/adminController')

// GET : /api/admin/summary 
// For getting all the metrics for the admin dashboard
router.get('/summary', metricsSummary)

module.exports = router
