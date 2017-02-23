'use strict';

require('dotenv').config();
let fs = require('fs');

let TicketGetter = require('./index.js');

let opts = {
    filename: './file.json',
    forceResponse: true
};

let zd = new TicketGetter(opts);


//zd.logOpts();

zd.populate()
    .then((res) => {
        console.log(res);
    });