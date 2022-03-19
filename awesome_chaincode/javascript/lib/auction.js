/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {
    Contract
} = require('fabric-contract-api');

class Auction extends Contract {

    constructor() {
        super('AuctionContract');
    }

    async submitAuction(ctx, auctionNumber, auctionObject) {
        var owner = ctx.clientIdentity.getID();
        console.info('============= START : Create Auction ===========');
        const auction = {
            docType: 'auction',
            auctionObject,
            owner,
            bids: [],
            active: true
        };
        await ctx.stub.putState('auction' + auctionNumber, Buffer.from(JSON.stringify(auction)));
        const serviceAsBytes = await ctx.stub.getState(owner); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        var user = JSON.parse(serviceAsBytes.toString());
        user.myAuctions.push('auction' + auctionNumber); // this is the posting auction issue
        await ctx.stub.putState(owner, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Create Auction ===========');
    }

    async submitBid(ctx, key, bid) {
        const serviceAsBytes = await ctx.stub.getState(key); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const auction = JSON.parse(serviceAsBytes.toString());
        var owner = ctx.clientIdentity.getID();
        let bidItem = {
            "customerID": owner,
            "bid": bid
        }
        if (auction.active == true) {
            auction.bids.push(bidItem);
            await ctx.stub.putState(key, Buffer.from(JSON.stringify(auction)));
        }
        console.log(serviceAsBytes.toString());
    }

    async decrementDutch(ctx, key){
      const serviceAsBytes = await ctx.stub.getState(key); // get the service from chaincode state
      if (!serviceAsBytes || serviceAsBytes.length === 0) {
          throw new Error(`${serviceNumber} does not exist`);
      }
      const auction = JSON.parse(serviceAsBytes.toString());
      const auctionObject = JSON.parse(auction.auctionObject);
      auctionObject.auctionRules.pricing.startPrice = parseFloat(auctionObject.auctionRules.pricing.startPrice) - parseFloat(auctionObject.auctionRules.pricing.biddingStep);
      auctionObject.auctionRules.pricing.startPrice = auctionObject.auctionRules.pricing.startPrice.toString();
      auction.auctionObject = JSON.stringify(auctionObject);
      await ctx.stub.putState(key, Buffer.from(JSON.stringify(auction)));
    }

    async incrementDutch(ctx, key){
      const serviceAsBytes = await ctx.stub.getState(key); // get the service from chaincode state
      if (!serviceAsBytes || serviceAsBytes.length === 0) {
          throw new Error(`${serviceNumber} does not exist`);
      }
      const auction = JSON.parse(serviceAsBytes.toString());
      const auctionObject = JSON.parse(auction.auctionObject);
      auctionObject.auctionRules.pricing.startPrice = parseFloat(auctionObject.auctionRules.pricing.startPrice) + parseFloat(auctionObject.auctionRules.pricing.biddingStep);
      auctionObject.auctionRules.pricing.startPrice = auctionObject.auctionRules.pricing.startPrice.toString();
      auction.auctionObject = JSON.stringify(auctionObject);
      await ctx.stub.putState(key, Buffer.from(JSON.stringify(auction)));
    }
}

module.exports = Auction;
