/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {
    Contract
} = require('fabric-contract-api');

class Registration extends Contract {

  constructor(){
      super('RegistrationContract');
  }

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        var witnesses = [];
        var customers = [];
        var providers = [];
        await ctx.stub.putState('witnessesPool', Buffer.from(JSON.stringify(witnesses)));
        await ctx.stub.putState('customersPool', Buffer.from(JSON.stringify(customers)));
        await ctx.stub.putState('providersPool', Buffer.from(JSON.stringify(providers)));
        console.info('============= END : Initialize Ledger ===========');
    }

    async registerCustomer(ctx) {
        const serviceAsBytes = await ctx.stub.getState('customersPool'); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const customersPool = JSON.parse(serviceAsBytes.toString());
        var owner = ctx.clientIdentity.getID();
        //check if registered
        for (var i = 0; i < customersPool.length; i++) {
            if (owner == customersPool[i].customerID) {
                return;
            }
        }
        let customer = {
            "customerID": owner,
            "state": "offline"
        }
        customersPool.push(customer);
        await ctx.stub.putState('customersPool', Buffer.from(JSON.stringify(customersPool)));
        var c = {
            "customerID": owner,
            "accountBalance": {
                "amount": "500",
                "currency": "euro"
            },
            "myAuctions": [],
            "mySLAs": []
        }
        await ctx.stub.putState(owner, Buffer.from(JSON.stringify(c)));
        console.log(serviceAsBytes.toString());
    }

    async registerProvider(ctx) {
        const serviceAsBytes = await ctx.stub.getState('providersPool'); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const providersPool = JSON.parse(serviceAsBytes.toString());
        var owner = ctx.clientIdentity.getID();
        //check if registered
        for (var i = 0; i < providersPool.length; i++) {
            if (owner == providersPool[i].providerID) {
                return;
            }
        }
        let provider = {
            "providerID": owner,
            "state": "offline"
        }
        providersPool.push(provider);
        await ctx.stub.putState('providersPool', Buffer.from(JSON.stringify(providersPool)));
        var p = {
            "providerID": owner,
            "accountBalance": {
                "amount": "500",
                "currency": "euro"
            },
            "myAuctions": [],
            "mySLAs": []
        }
        await ctx.stub.putState(owner, Buffer.from(JSON.stringify(p)));
        console.log(serviceAsBytes.toString());
    }

    async registerWitness(ctx) {
        const serviceAsBytes = await ctx.stub.getState('witnessesPool'); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const witnessesPool = JSON.parse(serviceAsBytes.toString());
        var owner = ctx.clientIdentity.getID();
        //check if registered
        for (var i = 0; i < witnessesPool.length; i++) {
            if (owner == witnessesPool[i].witnessID) {
                return;
            }
        }
        let witness = {
            "witnessID": owner,
            "state": "offline"
        }
        witnessesPool.push(witness);
        await ctx.stub.putState('witnessesPool', Buffer.from(JSON.stringify(witnessesPool)));
        var w = {
            "witnessID": owner,
            "accountBalance": {
                "amount": "50",
                "currency": "euro"
            },
            "mySLAs": []
        }
        await ctx.stub.putState(owner, Buffer.from(JSON.stringify(w)));
        console.log(serviceAsBytes.toString());
    }
}

module.exports = Registration;
