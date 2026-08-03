const express = require('express');
const routes = express.Router();
const {ping} = require('../controlador/pingController')

routes.get('/ping', ping);

module.exports = routes;