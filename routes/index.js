const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async function(req, res, next) {
  res.render('index', { title: 'VRC Api' });
});

router.get('/setCookie', async function(req, res, next) {
  res.render('setCookie', { cookie: req.query.cookie });
});

module.exports = router;
