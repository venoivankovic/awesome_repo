/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const Awesome = require('./lib/awesome');
const Registration = require('./lib/registration');
const UserData = require('./lib/userData');
const Auction = require('./lib/auction');
const Query = require('./lib/query');

module.exports.Awesome = Awesome;
module.exports.Registration = Registration;
module.exports.UserData = UserData;
module.exports.Auction = Auction;
module.exports.Query = Query;
module.exports.contracts = [ Awesome, Registration, UserData, Auction, Query ];
