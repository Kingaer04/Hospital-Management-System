const express = require('express');
const notificationRoute = require('./notifcationRoute');

const router = express.Router();

module.exports = (io) => {
    router.use('/notification', notificationRoute(io)); // Pass `io` to notificationRoute
    return router;
};