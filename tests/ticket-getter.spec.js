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
    it(' should be defined and strings', () => {
        env.ZENDESK_USER.should.be.a('string');
        env.ZENDESK_TOKEN.should.be.a('string');
        env.ZENDESK_URL.should.be.a('string');
    });
});


let TicketGetter = require('../index.js');

/*

should.equal
should.be.a.('string')
should.have.property('').equals('')
should.exist

*/

describe('TicketGetter', () => {

    describe('constructor', () => {
        it('should initialize an instance', () => {
            let opts = {};
            let tg = new TicketGetter();
            tg.should.be.a.instanceOf(TicketGetter);
        });
    });

    let file;
    describe('Populate by file', (done) => {
        it('Populate should create a file by default', (done) => {
            let tg = new TicketGetter();
            tg.populate()
                .then((res) => {
                    should.exist(res);
                    file = res.payload;
                    res.status.should.equal('OK');
                })
                .then((res) => {
                    fs.readFile(file, 'utf-8', (err, data) => {
                        data = JSON.parse(data);
                        should.exist(data.data);
                        should.exist(data.metadata.timestamp);
                        done();
                    });
                })
        }).timeout(30000);
    });

    describe('Populate by response', (done) => {
        it('Should have a response', (done) => {
            let tg = new TicketGetter({
                forceResponse: true
            });
            tg.populate()
                .then((res) => {
                    //console.log(res);
                    should.exist(res);
                    res.status.should.equal('OK');
                    should.exist(res.payload);
                    done();
                });
        }).timeout(30000);
    });


});