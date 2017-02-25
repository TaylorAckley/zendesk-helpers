'use strict';

require('dotenv').config();

let fs = require('fs');
let moment = require('moment');

let assert = require('assert');
let chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

let env = process.env;

describe('env vars', () => {
    it('should be defined and strings', () => {
        env.ZENDESK_USER.should.be.a('string');
        env.ZENDESK_TOKEN.should.be.a('string');
        env.ZENDESK_URL.should.be.a('string');
        //env.UNIT_TEST_TOKEN.should.be.a('string');
    });
});

let auth = require('../index.js');

/*

should.equal
should.be.a.('string')
should.have.property('').equals('')
should.exist

*/

describe('Auth', () => {


    describe('Auth', () => {
        it('should return a base64 string', () => {
            let token = auth.auth();
            token.should.be.a('string');
        });
    });


});