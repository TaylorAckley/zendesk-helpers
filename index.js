"use strict";

const TicketGetter = require('./lib/ticket-getter.module');
const auth = require('./lib/auth.module');

module.exports = TicketGetter;
module.exports.auth = auth;