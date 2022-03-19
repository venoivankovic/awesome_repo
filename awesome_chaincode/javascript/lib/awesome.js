/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {
    Contract
} = require('fabric-contract-api');

class Awesome extends Contract {

  constructor(){
      super('AWESOMEContract');
  }

    //used by end sla
    async addFunds(ctx, userID, plus) {
        const serviceAsBytes = await ctx.stub.getState(userID); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${user} does not exist`);
        }
        var user = JSON.parse(serviceAsBytes.toString());
        user.accountBalance.amount = parseFloat(user.accountBalance.amount) + parseFloat(plus);
        await ctx.stub.putState(userID, Buffer.from(JSON.stringify(user)));
    }

    async endForwardAuction(ctx, serviceNumber, slaID) {
        const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const service = JSON.parse(serviceAsBytes.toString());
        const auctionObject = JSON.parse(service.auctionObject);
        if (service.active == true && service.bids.length > 0) {
            if (auctionObject.auctionRules.auctionType == 'english' || auctionObject.auctionRules.auctionType == 'fpsb') {
                var biggest = 0;
                var biggestBid = {};
                var bid = {};
                for (var i = 0; i < service.bids.length; i++) {
                    bid = JSON.parse(service.bids[i].bid);
                    bid.owner = service.bids[i].customerID;
                    if (parseInt(bid.pricing.bidAmount) > biggest) {
                        biggest = parseInt(bid.pricing.bidAmount);
                        biggestBid = bid;
                    }
                }
                var reserveMet = await this.checkReservePrice(ctx, biggestBid, auctionObject);
                if(!reserveMet){
                  await this.deactivateService(ctx, service, serviceNumber);
                  return;
                }
                var provider = service.owner;
                var customer = biggestBid.owner;
                var sla = {
                    docType: 'sla',
                    biggestBid,
                    provider,
                    customer,
                    auctionObject,
                    witnesses: [],
                    ended: false
                };
                sla = await this.addWitnessesToSLA(ctx, sla);
                await this.addSLAToUsers(ctx, sla, slaID);
                sla = await this.setSLAdeadline(ctx, sla);
                await ctx.stub.putState('sla' + slaID, Buffer.from(JSON.stringify(sla)));
                service.active = false;
                await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
            } else if (auctionObject.auctionRules.auctionType == 'spsb') {
                var biggest = 0;
                var biggestBid = {};
                var bid = {};
                var sortBids = [];
                for (var i = 0; i < service.bids.length; i++) {
                    bid = JSON.parse(service.bids[i].bid);
                    bid.owner = service.bids[i].customerID;
                    sortBids.push(bid);
                }
                sortBids.sort(function(a, b) {
                    return parseFloat(b.pricing.bidAmount) - parseFloat(a.pricing.bidAmount);
                });
                biggestBid = sortBids[0];
                if (sortBids[1]) {
                    biggestBid.pricing.bidAmount = sortBids[1].pricing.bidAmount;
                }
                var reserveMet = await this.checkReservePrice(ctx, biggestBid, auctionObject);
                if(!reserveMet){
                  await this.deactivateService(ctx, service, serviceNumber);
                  return;
                }
                var provider = service.owner;
                var customer = biggestBid.owner;
                var sla = {
                    docType: 'sla',
                    biggestBid,
                    provider,
                    customer,
                    auctionObject,
                    ended: false
                };
                sla = await this.addWitnessesToSLA(ctx, sla);
                await this.addSLAToUsers(ctx, sla, slaID);
                sla = await this.setSLAdeadline(ctx, sla);
                await ctx.stub.putState('sla' + slaID, Buffer.from(JSON.stringify(sla)));
                service.active = false;
                await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
            } /*else if (auctionObject.auctionRules.auctionType == 'dutch') {
              var biggestBid = auctionObject.auctionRules.pricing.startPrice;
              var provider = service.owner;
              var customer = ctx.clientIdentity.getID();
              var sla = {
                  docType: 'sla',
                  biggestBid,
                  provider,
                  customer,
                  auctionObject,
                  ended: false
              }
              sla = await this.addWitnessesToSLA(ctx, sla);
              await this.addSLAToUsers(ctx, sla, slaID);
              sla = await this.setSLAdeadline(ctx, sla);
              await ctx.stub.putState('sla' + slaID, Buffer.from(JSON.stringify(sla)));
              service.active = false;
              await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
            }*/
        } else { // this is wrong, this is bad logic, this is never called
            service.active = false;
            await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
        }
        return JSON.stringify(service);
    }

    async endReverseAuction(ctx, serviceNumber, slaID) {
        const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const service = JSON.parse(serviceAsBytes.toString());
        const auctionObject = JSON.parse(service.auctionObject);
        if (service.active == true && service.bids.length > 0) {
            if (auctionObject.auctionRules.auctionType == 'english' || auctionObject.auctionRules.auctionType == 'fpsb') {
                var smallest = 10000000000000000000000000000000000000;
                var biggestBid = {};
                var bid = {};
                for (var i = 0; i < service.bids.length; i++) {
                    bid = JSON.parse(service.bids[i].bid);
                    bid.owner = service.bids[i].customerID;
                    if (parseInt(bid.pricing.bidAmount) < smallest) {
                        smallest = parseInt(bid.pricing.bidAmount);
                        biggestBid = bid;
                    }
                }
                //return JSON.stringify(biggestBid);
                var reserveMet = await this.checkReverseReservePrice(ctx, biggestBid, auctionObject);
                if(!reserveMet){
                  await this.deactivateService(ctx, service, serviceNumber);
                  return;
                }
                var customer = service.owner;
                var provider = biggestBid.owner;
                var sla = {
                    docType: 'sla',
                    biggestBid,
                    provider,
                    customer,
                    auctionObject,
                    witnesses: [],
                    ended: false
                };
                sla = await this.addWitnessesToSLA(ctx, sla);
                await this.addSLAToUsers(ctx, sla, slaID);
                sla = await this.setSLAdeadline(ctx, sla);
                await ctx.stub.putState('sla' + slaID, Buffer.from(JSON.stringify(sla)));
                service.active = false;
                await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
            } else if (auctionObject.auctionRules.auctionType == 'spsb') {
                var biggestBid = {};
                var bid = {};
                var sortBids = [];
                for (var i = 0; i < service.bids.length; i++) {
                    bid = JSON.parse(service.bids[i].bid);
                    bid.owner = service.bids[i].customerID;
                    sortBids.push(bid);
                }
                sortBids.sort(function(a, b) {
                    return parseFloat(a.pricing.bidAmount) - parseFloat(b.pricing.bidAmount);
                });
                biggestBid = sortBids[0];
                if (sortBids[1]) {
                    biggestBid.pricing.bidAmount = sortBids[1].pricing.bidAmount;
                }
                var reserveMet = await this.checkReverseReservePrice(ctx, biggestBid, auctionObject);
                if(!reserveMet){
                  await this.deactivateService(ctx, service, serviceNumber);
                  return;
                }
                var customer = service.owner;
                var provider = biggestBid.owner;
                var sla = {
                    docType: 'sla',
                    biggestBid,
                    provider,
                    customer,
                    auctionObject,
                    ended: false
                };
                sla = await this.addWitnessesToSLA(ctx, sla);
                await this.addSLAToUsers(ctx, sla, slaID);
                sla = await this.setSLAdeadline(ctx, sla);
                await ctx.stub.putState('sla' + slaID, Buffer.from(JSON.stringify(sla)));
                service.active = false;
                await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
            } /*else if (auctionObject.auctionRules.auctionType == 'dutch') {
              var biggestBid = auctionObject.auctionRules.pricing.startPrice;
              var provider = service.owner;
              var customer = ctx.clientIdentity.getID();
              var sla = {
                  docType: 'sla',
                  biggestBid,
                  provider,
                  customer,
                  auctionObject,
                  ended: false
              }
              sla = await this.addWitnessesToSLA(ctx, sla);
              await this.addSLAToUsers(ctx, sla, slaID);
              sla = await this.setSLAdeadline(ctx, sla);
              await ctx.stub.putState('sla' + slaID, Buffer.from(JSON.stringify(sla)));
              service.active = false;
              await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
            }*/
        } else { // this is wrong, this is bad logic, this is never called
            service.active = false;
            await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
        }
        return JSON.stringify(service);
    }

    async checkReservePrice(ctx, biggestBid, auctionObject){
      var winningBid = parseFloat(biggestBid.pricing.bidAmount);
      var reservePrice = parseFloat(auctionObject.auctionRules.pricing.pricingReserve);
      if(winningBid >= reservePrice){
        return true;
      } else {
        return false;
      }
    }

    async checkReverseReservePrice(ctx, biggestBid, auctionObject){
      var winningBid = parseFloat(biggestBid.pricing.bidAmount);
      var reservePrice = parseFloat(auctionObject.auctionRules.pricing.pricingReserve);
      if(winningBid <= reservePrice){
        return true;
      } else {
        return false;
      }
    }

    async deactivateService(ctx, service, serviceNumber){
      service.active = false;
      await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
    }

    async endForwardDutchAuction(ctx, serviceNumber, slaID){
      const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
      if (!serviceAsBytes || serviceAsBytes.length === 0) {
          throw new Error(`${serviceNumber} does not exist`);
      }
      const service = JSON.parse(serviceAsBytes.toString());
      const auctionObject = JSON.parse(service.auctionObject);
       if (auctionObject.auctionRules.auctionType == 'dutch') {
        var provider = service.owner;
        var customer = ctx.clientIdentity.getID();
        var biggestBid = {
          auctionID: serviceNumber,
          owner: customer,
          pricing: {
            bidAmount: auctionObject.auctionRules.pricing.startPrice,
            pricingSubscription: auctionObject.auctionRules.pricing.pricingSubscription,
          }
        }
        var sla = {
            docType: 'sla',
            biggestBid,
            provider,
            customer,
            auctionObject,
            ended: false
        }
        sla = await this.addWitnessesToSLA(ctx, sla);
        await this.addSLAToUsers(ctx, sla, slaID);
        sla = await this.setSLAdeadline(ctx, sla);
        await ctx.stub.putState('sla' + slaID, Buffer.from(JSON.stringify(sla)));
        service.active = false;
        await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
      }
    }

    async endReverseDutchAuction(ctx, serviceNumber, slaID){
      const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
      if (!serviceAsBytes || serviceAsBytes.length === 0) {
          throw new Error(`${serviceNumber} does not exist`);
      }
      const service = JSON.parse(serviceAsBytes.toString());
      const auctionObject = JSON.parse(service.auctionObject);
       if (auctionObject.auctionRules.auctionType == 'dutch') {
        var customer = service.owner;
        var provider = ctx.clientIdentity.getID();
        var biggestBid = {
          auctionID: serviceNumber,
          owner: customer,
          pricing: {
            bidAmount: auctionObject.auctionRules.pricing.startPrice,
            pricingSubscription: auctionObject.auctionRules.pricing.pricingSubscription,
          }
        }
        var sla = {
            docType: 'sla',
            biggestBid,
            provider,
            customer,
            auctionObject,
            ended: false
        }
        sla = await this.addWitnessesToSLA(ctx, sla);
        await this.addSLAToUsers(ctx, sla, slaID);
        sla = await this.setSLAdeadline(ctx, sla);
        await ctx.stub.putState('sla' + slaID, Buffer.from(JSON.stringify(sla)));
        service.active = false;
        await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
      }
    }


    async setSLAdeadline(ctx, sla) {
        var dateTimestamp = ctx.stub.getDateTimestamp();
        var days = parseInt(sla.auctionObject.service.witnessGlobalRules.witnessGamePeriod.days);
        var hours = parseInt(sla.auctionObject.service.witnessGlobalRules.witnessGamePeriod.hours);
        var minutes = parseInt(sla.auctionObject.service.witnessGlobalRules.witnessGamePeriod.minutes);
        var seconds = parseInt(sla.auctionObject.service.witnessGlobalRules.witnessGamePeriod.seconds);
        dateTimestamp.setDate(dateTimestamp.getDate() + days);
        dateTimestamp.setHours(dateTimestamp.getHours() + hours);
        dateTimestamp.setMinutes(dateTimestamp.getMinutes() + minutes);
        dateTimestamp.setSeconds(dateTimestamp.getSeconds() + seconds);
        sla.auctionObject.service.witnessGlobalRules.slaDeadline = dateTimestamp;
        return sla;
    }

    async addSLAToUsers(ctx, sla, slaID) {
        //provider
        var serviceFee = sla.biggestBid.pricing.bidAmount;
        const serviceAsBytes = await ctx.stub.getState(sla.provider); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${sla.provider} does not exist`);
        }
        var provider = JSON.parse(serviceAsBytes.toString());
        provider.mySLAs.push('sla' + slaID);
        //await this.addFunds(ctx, sla.provider, serviceFee);
        provider.accountBalance.amount = parseInt(provider.accountBalance.amount) + parseInt(serviceFee);
        await ctx.stub.putState(sla.provider, Buffer.from(JSON.stringify(provider)));
        //customer
        const serviceAsBytes1 = await ctx.stub.getState(sla.customer); // get the service from chaincode state
        if (!serviceAsBytes1 || serviceAsBytes1.length === 0) {
            throw new Error(`${sla.customer} does not exist`);
        }
        var customer = JSON.parse(serviceAsBytes1.toString());
        customer.mySLAs.push('sla' + slaID);
        //await this.withdrawFunds(ctx, sla.customer, serviceFee);
        customer.accountBalance.amount = parseInt(customer.accountBalance.amount) - parseInt(serviceFee);
        await ctx.stub.putState(sla.customer, Buffer.from(JSON.stringify(customer)));
        //witnesses
        for (var i = 0; i < sla.witnesses.length; i++) {
            var witnessID = sla.witnesses[i].witnessID;
            await this.addSLAToWitness(ctx, witnessID, slaID)
        }
    }

    async addSLAToWitness(ctx, witnessID, slaID) {
        const serviceAsBytes = await ctx.stub.getState(witnessID); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${sla.provider} does not exist`);
        }
        var witness = JSON.parse(serviceAsBytes.toString());
        witness.mySLAs.push('sla' + slaID);
        await ctx.stub.putState(witnessID, Buffer.from(JSON.stringify(witness)));
    }

    async addWitnessesToSLA(ctx, sla) { //not defined for some reason
        const serviceAsBytes = await ctx.stub.getState('witnessesPool'); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const witnessesPool = JSON.parse(serviceAsBytes.toString());
        //sla.witnesses = witnessesPool
        sla.witnesses = await this.getRandomWitnesses(witnessesPool, parseInt(sla.auctionObject.service.witnessGlobalRules.n));
        var sloDeadline = ctx.stub.getDateTimestamp();
        var startTime = sloDeadline;
        sla.auctionObject.service.sloRulesAndFines.startTime = startTime;
        for (var i = 0; i < sla.auctionObject.service.sloRulesAndFines.length; i++) {
            sla.auctionObject.service.sloRulesAndFines[i].sloVotingBuckets = [];
            sla.auctionObject.service.sloRulesAndFines[i].sloDeadline = sloDeadline;
        }
        //sla.n = sla.auctionObject.service.witnessGlobalRules.n;
        //sla.test = (parseInt(sla.auctionObject.service.witnessGlobalRules.n) + 2).toString();
        return sla;
        //add math.random choose witnesses
    }

    //end SLO payout

    //end SLA payout
    async endSLA(ctx, slaKey) {
        const serviceAsBytes = await ctx.stub.getState(slaKey); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        var sla = JSON.parse(serviceAsBytes.toString());
        if (sla.ended == true) {
            return
        }
        sla.ended = true;
        var sloRulesAndFines = sla.auctionObject.service.sloRulesAndFines;
        var userPayouts = {
            provider: {
                id: sla.provider,
                payout: 0
            },
            customer: {
                id: sla.customer,
                payout: 0
            },
            witnesses: [],
            totalReward: 0
        };
        //console.log(sla.witnesses);
        for (var i = 0; i < sla.witnesses.length; i++) {
            var witnessID = sla.witnesses[i].witnessID;
            var witness = {
                id: witnessID,
                payout: 0
            };
            userPayouts.witnesses.push(witness);
        }
        var witnessGlobalRules = sla.auctionObject.service.witnessGlobalRules;
        for (var i = 0; i < sloRulesAndFines.length; i++) {
            var slo = sloRulesAndFines[i];
            for (var j = 0; j < slo.sloVotingBuckets.length; j++) {
                var bucket = slo.sloVotingBuckets[j];
                if (bucket.length >= witnessGlobalRules.m) {
                    //console.log(i+" "+bucket+" violated");
                    userPayouts = await this.sloViolated(slo, bucket, userPayouts);
                } else if (bucket.length < witnessGlobalRules.m) {
                    //console.log(i+" "+bucket+" not violated");
                    userPayouts = await this.sloNotViolated(slo, bucket, userPayouts);
                }
            }
        }
        userPayouts.customer.payout = parseFloat(userPayouts.customer.payout) - (parseFloat(sla.auctionObject.service.witnessGlobalRules.cFee) * 0.01 * parseFloat(userPayouts.totalReward));
        userPayouts.provider.payout = parseFloat(userPayouts.provider.payout) - (parseFloat(sla.auctionObject.service.witnessGlobalRules.pFee) * 0.01 * parseFloat(userPayouts.totalReward));
        sla.userPayouts = userPayouts;
        await this.addFunds(ctx, userPayouts.provider.id, userPayouts.provider.payout);
        await this.addFunds(ctx, userPayouts.customer.id, userPayouts.customer.payout);
        for (var i = 0; i < userPayouts.witnesses.length; i++) {
          await this.addFunds(ctx, userPayouts.witnesses[i].id, userPayouts.witnesses[i].payout);
        }
        await ctx.stub.putState(slaKey, Buffer.from(JSON.stringify(sla)));
        //await this.slaPayout(ctx, slaKey);
    }

    async sloViolated(slo, bucket, userPayouts) {
        userPayouts.provider.payout = parseFloat(userPayouts.provider.payout) - parseFloat(slo.ruleFine);
        userPayouts.customer.payout = parseFloat(userPayouts.customer.payout) + parseFloat(slo.ruleFine);
        var witnessArr = [];
        for (var i = 0; i < userPayouts.witnesses.length; i++) {
            witnessArr.push(userPayouts.witnesses[i].id);
        }
        var rewardArr = bucket;
        var punishmentArr = witnessArr.filter(x => !bucket.includes(x));
        for (var i = 0; i < rewardArr.length; i++) {
            for (var j = 0; j < userPayouts.witnesses.length; j++) {
                if (rewardArr[i] == userPayouts.witnesses[j].id) {
                    userPayouts.witnesses[j].payout = parseFloat(userPayouts.witnesses[j].payout) + parseFloat(slo.sloWitnessConfig.rewardViolation);
                    userPayouts.totalReward = parseFloat(userPayouts.totalReward) + parseFloat(slo.sloWitnessConfig.rewardViolation);
                }
            }
        }
        for (var i = 0; i < punishmentArr.length; i++) {
            for (var j = 0; j < userPayouts.witnesses.length; j++) {
                if (punishmentArr[i] == userPayouts.witnesses[j].id) {
                    userPayouts.witnesses[j].payout = parseFloat(userPayouts.witnesses[j].payout) - parseFloat(slo.sloWitnessConfig.punishmentViolation);
                    userPayouts.customer.payout = parseFloat(userPayouts.customer.payout) + parseFloat(slo.sloWitnessConfig.punishmentViolation);
                }
            }
        }
        return userPayouts;
    }

    async sloNotViolated(slo, bucket, userPayouts) {
        var witnessArr = [];
        for (var i = 0; i < userPayouts.witnesses.length; i++) {
            witnessArr.push(userPayouts.witnesses[i].id);
        }
        var punishmentArr = bucket;
        var rewardArr = witnessArr.filter(x => !bucket.includes(x));
        for (var i = 0; i < rewardArr.length; i++) {
            for (var j = 0; j < userPayouts.witnesses.length; j++) {
                if (rewardArr[i] == userPayouts.witnesses[j].id) {
                    userPayouts.witnesses[j].payout = parseFloat(userPayouts.witnesses[j].payout) + parseFloat(slo.sloWitnessConfig.rewardNoViolation);
                    userPayouts.totalReward = parseFloat(userPayouts.totalReward) + parseFloat(slo.sloWitnessConfig.rewardNoViolation);
                }
            }
        }
        for (var i = 0; i < punishmentArr.length; i++) {
            for (var j = 0; j < userPayouts.witnesses.length; j++) {
                if (punishmentArr[i] == userPayouts.witnesses[j].id) {
                    userPayouts.witnesses[j].payout = parseFloat(userPayouts.witnesses[j].payout) - parseFloat(slo.sloWitnessConfig.punishmentNoViolation);
                    userPayouts.provider.payout = parseFloat(userPayouts.provider.payout) + parseFloat(slo.sloWitnessConfig.punishmentNoViolation);
                }
            }
        }
        return userPayouts;
    }

    async submitWitnessVote(ctx, slaKey, slo) {
        const serviceAsBytes = await ctx.stub.getState(slaKey); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        var sla = JSON.parse(serviceAsBytes.toString());
        var voteTimestamp = ctx.stub.getDateTimestamp();
        var sloDeadline = new Date(sla.auctionObject.service.sloRulesAndFines[slo].sloDeadline);
        var witness = ctx.clientIdentity.getID();
        //add check if witness is one of the monitoring witnesses -- still wip
        var falseWitness = true;
        for (var i = 0; i < sla.witnesses.length; i++) {
            if (sla.witnesses[i].witnessID == witness) {
                falseWitness = false;
            }
        }
        if (falseWitness) {
            return;
        }
        var distance = sloDeadline - voteTimestamp;
        var sloVotingBuckets = sla.auctionObject.service.sloRulesAndFines[slo].sloVotingBuckets;
        if (distance > 0) {
            for (var i = 0; i < sloVotingBuckets[sloVotingBuckets.length - 1].length; i++) {
                //if (sloVotingBuckets[sloVotingBuckets.length - 1][i].witness == witness) {
                if (sloVotingBuckets[sloVotingBuckets.length - 1][i] == witness) {
                    return;
                }
            }
        } else {
            sloVotingBuckets.push([]);
        }
        /*var vote = {
          witness,
          voteTimestamp
        }*/
        sloVotingBuckets[sloVotingBuckets.length - 1].push(witness);
        sla.auctionObject.service.sloRulesAndFines[slo].sloVotingBuckets = sloVotingBuckets;
        sla = await this.changeSloDeadline(ctx, voteTimestamp, sla, slo);
        await ctx.stub.putState(slaKey, Buffer.from(JSON.stringify(sla)));
    }

    async changeSloDeadline(ctx, voteTimestamp, sla, slo) {
        var hours = parseInt(sla.auctionObject.service.sloRulesAndFines[slo].sloWitnessConfig.tPeriod.hours);
        var minutes = parseInt(sla.auctionObject.service.sloRulesAndFines[slo].sloWitnessConfig.tPeriod.minutes);
        var seconds = parseInt(sla.auctionObject.service.sloRulesAndFines[slo].sloWitnessConfig.tPeriod.seconds);
        voteTimestamp.setHours(voteTimestamp.getHours() + hours);
        voteTimestamp.setMinutes(voteTimestamp.getMinutes() + minutes);
        voteTimestamp.setSeconds(voteTimestamp.getSeconds() + seconds);
        sla.auctionObject.service.sloRulesAndFines[slo].sloDeadline = voteTimestamp;
        return sla;
    }

    //https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
    //random elements from array
    async getRandomWitnesses(arr, n) {
        var result = new Array(n);
        var len = arr.length;
        var taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }
}

module.exports = Awesome;
