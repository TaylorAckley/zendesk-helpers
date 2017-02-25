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
                    should.exist(res);
                    res.status.should.equal('OK');
                    should.exist(res.payload);
                    done();
                });
        }).timeout(30000);
    });

    describe('Should use search endpoint if query is present.', (done) => {
        it('Should have a response', (done) => {
            let tg = new TicketGetter({
                forceResponse: true,
                query: 'type:ticket tags:priority-normal',

            });
            tg.populate()
                .then((res) => {
                    should.exist(res);
                    res.status.should.equal('OK');
                    should.exist(res.payload.data[0].id);
                    done();
                });
        }).timeout(30000);

        it('Should error if both a query and sideload are present.', (done) => {
            let tg = new TicketGetter({
                forceResponse: true,
                query: 'type:ticket tags:priority-normal',
                sideloads: 'comment_count'

            });
            tg.populate()
                .catch((err) => {
                    should.exist(err);
                    err.should.equal('Error: Sideloads are unavailable when paired with a query.  If you are including a query, you cannot include a sideload.');
                    done();
                });
        }).timeout(30000);
    });


    describe('Should sideload ticket metrics.', (done) => {
        it('Should output a file', (done) => {
            let tg = new TicketGetter({
                sideloads: 'comment_count',
                forceResponse: true
            });
            tg.populate()
                .then((res) => {
                    should.exist(res);
                    res.status.should.equal('OK');
                    should.exist(res.payload.data[0].comment_count);
                    done();
                });
        }).timeout(30000);
    });


});