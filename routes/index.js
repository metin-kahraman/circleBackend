const express = require('express')
const router = express.Router();
const authRoutes = require('./users');


router.use('/auth', authRoutes);

module.exports = router;