const express = require('express');
const router = express.Router();

const {generateARForProperty } = require('../controller/arController');

router.post('/properties/:id/generate-ar', generateARForProperty);

module.exports = router;
