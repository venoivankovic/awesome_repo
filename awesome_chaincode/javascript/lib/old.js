async loginWitness(ctx) {
    const serviceAsBytes = await ctx.stub.getState('witnessesPool'); // get the service from chaincode state
    if (!serviceAsBytes || serviceAsBytes.length === 0) {
        throw new Error(`${serviceNumber} does not exist`);
    }
    const witnessesPool = JSON.parse(serviceAsBytes.toString());
    var owner = ctx.clientIdentity.getID();
    for (var i = 0; i < witnessesPool.length; i++) {
        if (owner == witnessesPool[i].witnessID) {
            witnessesPool[i].state = "online";
        }
    }
    await ctx.stub.putState('witnessesPool', Buffer.from(JSON.stringify(witnessesPool)));
    console.log(serviceAsBytes.toString());
}

async submitWitness(ctx, key) {
    /*here add 2 conditions
    1. witnesses can only be added if maximal number of witnesses not reached
    2. only witness not already added can be added
    */
    const serviceAsBytes = await ctx.stub.getState(key); // get the service from chaincode state
    if (!serviceAsBytes || serviceAsBytes.length === 0) {
        throw new Error(`${serviceNumber} does not exist`);
    }
    const sla = JSON.parse(serviceAsBytes.toString());
    var owner = ctx.clientIdentity.getID();
    var bool = true;
    //let auctionObject = JSON.parse(sla.auctionObject);
    /*  if(sla.witnesses.length >= parseInt(sla.auctionObject.service.witnessGlobalRules.n)){
        bool = false;
      }
      for (var i = 0; i < sla.witnesses.length; i++) {
        if(owner == witnesses[i]){
          bool = false;
        }
      }*/
    if (bool) {
        sla.witnesses.push(owner);
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
    }
    console.log(serviceAsBytes.toString());
}
