/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {
    Contract
} = require('fabric-contract-api');

class Query extends Contract {

    constructor() {
        super('QueryContract');
    }

    async queryService(ctx, serviceNumber) {
        const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        console.log(serviceAsBytes.toString());
        return serviceAsBytes.toString();
    }

    async queryAllServicesAsOwner(ctx) {
        var invokeID = ctx.clientIdentity.getID();
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.owner == invokeID) {
                allResults.push({
                    Key: key,
                    Record: record
                });
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryServiceAsCustomer(ctx, serviceNumber) {
        const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const service = JSON.parse(serviceAsBytes.toString());
        let auctionObject = JSON.parse(service.auctionObject);
        if (auctionObject.auctionRules.auctionType == 'fpsb' || auctionObject.auctionRules.auctionType == 'spsb') {
            service.bids = ['hidden'];
        }
        if (service.active == true) {
            return JSON.stringify(service);
        }
    }

    async queryServiceAsProvider(ctx, serviceNumber) {
        const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const service = JSON.parse(serviceAsBytes.toString());
        let auctionObject = JSON.parse(service.auctionObject);
        if (auctionObject.auctionRules.auctionType == 'fpsb' || auctionObject.auctionRules.auctionType == 'spsb') {
            service.bids = ['hidden'];
        }
        if (service.active == true) {
            return JSON.stringify(service);
        }
    }

    async queryAllServicesAsCustomer(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            let auctionObject;
            try {
                record = JSON.parse(strValue);
                auctionObject = JSON.parse(record.auctionObject);
                if (auctionObject.auctionRules.auctionType == 'fpsb' || auctionObject.auctionRules.auctionType == 'spsb') {
                    record.bids = ['hidden'];
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.active == true && auctionObject.auctionRules.auctionDirection == 'forward') {
                allResults.push({
                    Key: key,
                    Record: record
                });
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryAllServicesAsProvider(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            let auctionObject;
            try {
                record = JSON.parse(strValue);
                auctionObject = JSON.parse(record.auctionObject);
                if (auctionObject.auctionRules.auctionType == 'fpsb' || auctionObject.auctionRules.auctionType == 'spsb') {
                    record.bids = ['hidden'];
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.active == true && auctionObject.auctionRules.auctionDirection == 'reverse') {
                allResults.push({
                    Key: key,
                    Record: record
                });
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryAllSLAs(ctx) {
        var invokeID = ctx.clientIdentity.getID();
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType == 'sla' && ((record.customer == invokeID) || (record.provider == invokeID))) {
                allResults.push({
                    Key: key,
                    Record: record
                });
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryMySLAsAsWitness(ctx) {
        var invokeID = ctx.clientIdentity.getID();
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType == 'sla') {
                for (var i = 0; i < record.witnesses.length; i++) {
                    if (record.witnesses[i].witnessID == invokeID) {
                        allResults.push({
                            Key: key,
                            Record: record
                        });
                    }
                }
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryAllActiveSLAs(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType == 'sla') {
                if (!record.ended) {
                    allResults.push({
                        Key: key,
                        Record: record
                    });
                }
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryAllActiveAuctions(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType == 'sla') {
                if (!record.ended) {
                    allResults.push({
                        Key: key,
                        Record: record
                    });
                }
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryAllActiveAuctionsAndSLAs(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType == 'sla') {
                if (!record.ended) {
                    allResults.push({
                        Key: key,
                        Record: record
                    });
                }
            }
            if (record.docType == 'auction') {
                if (record.active) {
                    var parsedAuctionObject = JSON.parse(record.auctionObject);
                    if (parsedAuctionObject.auctionRules.auctionType != 'dutch') {
                        allResults.push({
                            Key: key,
                            Record: record
                        });
                    }
                }
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryAllServices(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({
                Key: key,
                Record: record
            });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

}

module.exports = Query;
