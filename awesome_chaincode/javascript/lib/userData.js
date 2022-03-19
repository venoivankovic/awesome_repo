/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {
    Contract
} = require('fabric-contract-api');

class UserData extends Contract {

  constructor(){
      super('UserDataContract');
  }

  async queryUserData(ctx) {
      var user = ctx.clientIdentity.getID();
      const serviceAsBytes = await ctx.stub.getState(user); // get the service from chaincode state
      if (!serviceAsBytes || serviceAsBytes.length === 0) {
          throw new Error(`${user} does not exist`);
      }
      console.log(serviceAsBytes.toString());
      return serviceAsBytes.toString();
  }

  async addBalance(ctx, plus) {
      var userID = ctx.clientIdentity.getID();
      const serviceAsBytes = await ctx.stub.getState(userID); // get the service from chaincode state
      if (!serviceAsBytes || serviceAsBytes.length === 0) {
          throw new Error(`${user} does not exist`);
      }
      var user = JSON.parse(serviceAsBytes.toString());
      user.accountBalance.amount = parseInt(user.accountBalance.amount) + parseInt(plus);
      await ctx.stub.putState(userID, Buffer.from(JSON.stringify(user)));
  }

  async withdrawBalance(ctx, minus) {
      var userID = ctx.clientIdentity.getID();
      const serviceAsBytes = await ctx.stub.getState(userID); // get the service from chaincode state
      if (!serviceAsBytes || serviceAsBytes.length === 0) {
          throw new Error(`${user} does not exist`);
      }
      var user = JSON.parse(serviceAsBytes.toString());
      user.accountBalance.amount = parseInt(user.accountBalance.amount) - parseInt(minus);
      await ctx.stub.putState(userID, Buffer.from(JSON.stringify(user)));
  }

}

module.exports = UserData;
