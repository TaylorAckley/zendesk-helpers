'use strict';

const _ = require('lodash');
const moment = require('moment');
const request = require('request');
const req = require('request-promise');
const fs = require('fs');
const auth = require('./auth.module.js');
let Promise = require('bluebird');

class TicketGetter {
    constructor(opts) {
        opts = opts ? opts : {};
        this._url = opts.url || process.env.ZENDESK_URL;
        this._token = opts.auth || process.env.ZENDESK_TOKEN;
        this._query = opts.query ? {
            query: opts.query
        } : undefined;
        this._user = opts.user || process.env.ZENDESK_USER;
        this.forceResponse = opts.forceResponse || false
        this._file = opts.filename || './ticket.data.json';
        this._auth = auth(this._user, this._token);
        this._type = opts.query ? 'search' : 'tickets';
        this._endpoint = opts.query ? `${this._url}/api/v2/search.json` : `${this._url}/api/v2/tickets.json`;
        this.tickets = [];
        this._pgCount = 0;
        this._pgsRetreived = 0;
    }

    getTickets() {
        let _endpoint = this._endpoint;
        let _auth = this._auth;
        let _query = this._query;
        let self = this;
        return new Promise((resolve, reject) => {
            let options = {
                method: 'GET',
                url: _endpoint,
                qs: {
                    query: _query
                },
                headers: {
                    'Content-Type': 'application/json',
                    authorization: _auth,
                    'User-Agent': 'Request-Promise'
                },
                json: true
            };
            req(options)
                .then((res) => {
                    console.log(`Response Returned ${res.count} tickets`);
                    resolve(Math.ceil(res.count / 100));
                });
        });
    }

    getPage(pg) {
        let _endpoint = this._endpoint;
        let _auth = this._auth
        let _query = this._query;
        let options = {
            method: 'GET',
            url: _endpoint,
            qs: {
                page: pg,
                query: _query
            },
            headers: {
                'Content-Type': 'application/json',
                authorization: _auth,
                'User-Agent': 'Request-Promise'
            },
            json: true
        };
        return new Promise((resolve, reject) => {
            req(options)
                .then((res) => {
                    let _tickets = this._type === 'tickets' ? res.tickets : res.results;
                    for (let i = 0; i < _tickets.length; i++) {
                        this.tickets.push(_tickets[i]);
                    }
                    this._pgsRetreived += 1;
                    console.log(`Page ${pg} of ${this._pgCount} done. (${this._pgsRetreived})`);
                    if (this._pgsRetreived === this._pgCount) {
                        var timestamp = moment().format();
                        var closedTicketsPeriod = moment().subtract(120, 'days').format();
                        console.log(`Retrieved ${this._pgsRetreived} of ${this._pgCount} (${this.tickets.length}).  Building payload.`);
                        let payload = {
                            metadata: {
                                timestamp: timestamp,
                                closedTicketsPeriod: closedTicketsPeriod
                            },
                            data: this.tickets
                        };
                        this.payload = payload;
                        if (!this.forceResponse || this.forceResponse === false) {
                            fs.writeFile(this._file, JSON.stringify(payload), (err) => {
                                if (err) {
                                    reject(err);
                                }
                            });
                        }
                        //clear data
                        this.tickets = [];
                        this._pgsRetreived = 0;
                        this._pgCount = 0;
                    }
                    resolve(true);
                })
                .catch((err) => reject(err));
        });
        //   });
        //});
    }

    populate() {
        return new Promise((resolve, reject) => {
            this.getTickets()
                .then((pgCount) => {
                    this._pgCount = pgCount;
                    console.log(`Retreiving ${this._pgCount} pages of ticket data`);
                })
                .then(() => {
                    for (var i = 1; i < (this._pgCount + 1); i++) {
                        console.log(`Getting page ${i} of ${this._pgCount}`);
                        this.getPage(i)
                            .then((res) => {
                                if (this._pgCount === this._pgsRetreived) {
                                    resolve({
                                        status: 'OK',
                                        ts: moment().format(),
                                        payload: this.forceResponse ? this.payload : this._file
                                    });
                                }
                            })
                            .catch((err) => reject(err));
                    }
                })
                .then((res) => {

                })
                .catch((err) => reject(err));

        });
    }
    //end of class.
}

module.exports = TicketGetter;