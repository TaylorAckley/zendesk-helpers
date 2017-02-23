'use strict';

//let fs = require('fs');

let auth = (user, token) => {
    let _user = user || process.env.ZENDESK_USER;
    let _token = token || process.env.ZENDESK_TOKEN;
    //fs.writeFile('token.txt', 'Basic ' + new Buffer(_user + '/token:' + _token).toString('base64'));
    return 'Basic ' + new Buffer(_user + '/token:' + _token).toString('base64');
};

module.exports = auth;