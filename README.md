# Zendesk-Helpers

[![Build Status](https://travis-ci.org/TaylorAckley/zendesk-helpers.svg?branch=master)](https://travis-ci.org/TaylorAckley/zendesk-helpers)

##### Components
- Authorization generator for use in headers.
- TicketGetter to retrieve tickets.

## Use Case

Zendesk-Helpers has two parts.   The use cases are:

**AUTHORIZATION GENERATOR**
1) I want to generate a authorization header to send along with my Zendesk API call.

**TICKETGETTER**
1) I want to grab my tickets from the Zendesk API without having to deal with implementing pagination.
2) I want to easily store the returned tickets in a JSON file to do some map/reduce functions on them for analytics.
3) I want to persist those records to a database.
4) I want to force a response as an array and return them as part of a application API request.

## Installation

`npm i zendesk-helpers --save`

For convenience add the following constants to your `.env` file (`process.env`)
- `ZENDESK_URL` - Url for your Zendesk.  Ex: `https://obscura.knowledgeanywhere.com` (not needed if your only using the authorization generator)
- `ZENDESK_USER` - The administrator (email) to be used in conjunction with the API key.  Ex: `taylorackley@gmail.com`
- `ZENDESK_TOKEN` - The API key from Zendesk.   You can obtain this by going to Settings > Channels Section > API and clicking new.

Having this constants as environment variables are optional, but convenient and secure.   They will need to be passed into the class constructor otherwise.

## Usage

### Authorization

Use the generator to grab the base 64 string to be passed along with the Authorization header to the Zendesk REST API.

```javascript
'use strict'; // long live arrow functions and lexical this.
let zh = require('zendesk-helpers');
let request = require('request')
let req = require('request-promise');
// The below assumes process.env.ZENDESK_USER and process.env.ZENDESK_TOKEN are defined.   Otherwise you must pass them in.
let auth = zh.auth();

//or manually pass them in.
let auth = zh.auth('admin@admin.com', 'sjdxxxxxxxxxx');


        let options = {
            method: 'GET',
            url: 'https://obscura.zendesk.com/api/v2/search.json',
            qs: {
                include: 'comment_count,groups',
                query: 'type:ticket tags:priority_normal',
            },
            headers: {
                'Content-Type': 'application/json',
                authorization: auth, // use the auth variable in a request.
                'User-Agent': 'Request-Promise'
            },
            json: true
        };
        req(options)
        .then((res) => console.log(res))
        .catch((err) => console.log('doh'));
```

### TicketGetter

The Zendesk RESTful API is pretty well designed all things considered.   The challenge Zendesk has is dealing with the unkown size of the response when it grabs the tickets.    Some Zendesk instances might return a thousand tickets, not that big of a deal.  Others, might return 30,000.  Whoah.  Hence, Zendesk implements pagination to its API for every 100 tickets.   This can be a challenge to deal with on a recurring basis.   It also presents a challenge to you on how best to work with that data and mold it if you are wishing to report on it and do advanced analytics.

The TicketGetter class built in Zendesk-Helpers makes this task a little bit easier by doing some of the grunt work for you.  it makes the call to the Zendesk API, figures out how many pages it needs to get, and will iterate through all of them for you.

When it has succesfully grabbed all the tickets, it will by **DEFAULT** write them to a file, unless you force a response with the array of tickets.  The latter is not recommended unless you are dealing with smaller buckets of tickets.

### Sideloads and Queries

The TicketGetter constructor optionally accepts `query` and `sideloads` properties.   You can provide the properties as the Zendesk API would normally accept it.

- More on Side-Loading: [Zendesk - Core API - Side-Loading](https://developer.zendesk.com/rest_api/docs/core/side_loading)
- More on Queries[Zendesk - Core API - Searching](https://help.zendesk.com/hc/en-us/articles/229136927)

If **BOTH**  `query` and `sideloads` properties are passed to the constructor, it will throw an error since the search.json endpoint does not support sideloads.

### Options

TicketGetter is a Class and takes a constructor with the following options.

**IMPORTANT:** If a query is not provided, TicketGetter will use the tickets.json API endpoint.   If a query IS provided, it will use the search.json endpoint.

```javascript
//All options are technically optional as far as the constructor is concerned.   The first three constants can be present as environment variables.
let options = {
    url: 'obscura.knowledgeanywhere.com' //Url for your Zendesk.  OR process.env.ZENDESK_URL if its defined (recommended).  No trailing slash!
    token: 'xxxxxxx' //API token from Zendesk.  OR process.env.ZENDESK_TOKEN if its defined (STRONGLY recommended)
    user: 'admin@admin.com' //Email address for the adminstrator that owns the token.  OR process.env.ZENDESK_USER (recommended).
    filename: 'ticket.data.json' //OPTIONAL. filename of the outputted tickets.  Defaults to 'tickets.data.json'.
    forceResponse: false //OPTIONAL Defaults to false.  If true will return an array of tickets under the 'payload' property.
    query: 'type:tickets status:open tags:priority_normal' // OPTIONAL. Query to be used with the search.json endpoint.    See note above.
    sideloads: 'comment_count,metric_events,users' // OPTIONAL. Sideloads related records.
};
```

### Usage

Once you have built your options object, you're all set!   Create a new instance of the TicketGetter class and call the populate method.   Returns a promise with a response object containing metadata and the filename OR ticket array.

```javascript
let tg = new TicketGetter();
tg.populate(options)
    .then()
    .catch();
```

**Example**

```env
# .env file.  Make sure you add this to .gitignore
ZENDESK_URL="https://obscura.zendesk.com" # No trailing slash!
ZENDESK_USER="admin@admin.com"
ZENDESK_TOKEN="xxxxx"
```

```javascript
'use strict';
let zh = require('zendesk-helpers');
let tg = new TicketGetter(); // construct with default options.
zd.populate() //Use default options
    .then((res) = {
        makeAnalytics(res);
        /*
        {
            "metadata": {
                "timestamp": "2017-02-22T20:40:45-08:00",
                "closedTicketsPeriod": "2016-10-25T20:40:45-07:00"
            },
            "data": [{
                "id": .......
            }]
        }
        */
    })
    .catch((err) => handleError(err));
```

### Another Example

If you have a dashboard, you can use an interval to constantly refresh the data.

```javascript

tg.populate(); // Initial population of ticket.data.json
setInterval(() => {
tg.populate()
.then((res) => {
//emit an event over websockets the data has been refreshed.
})
.catch();
}, 10000)





