'use strict';
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const bodyParser = require('body-parser');
const http = require('http')
const util = require('util');
const express = require('express')
const app = express();
const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken');
const bearerToken = require('express-bearer-token');
const cors = require('cors');

const helper = require('./util/helper');
const jsonHelper = require('./util/jsonHelper');
//const app = express();
//app.use(bodyParser.json());

app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// set secret variable
app.set('secret', 'thisismysecret');
app.use(expressJWT({
  secret: 'thisismysecret'
}).unless({
  path: ['/users', '/users/login', '/register']
}));
app.use(bearerToken());

const {
  Wallets,
  Gateway
} = require('fabric-network');
const fs = require('fs');
const path = require('path');

app.use((req, res, next) => {
  logger.debug('New req for %s', req.originalUrl);
  if (req.originalUrl.indexOf('/users') >= 0 || req.originalUrl.indexOf('/users/login') >= 0 || req.originalUrl.indexOf('/register') >= 0) {
    return next();
  }
  var token = req.token;
  jwt.verify(token, app.get('secret'), (err, decoded) => {
    if (err) {
      console.log(`Error ================:${err}`)
      res.send({
        success: false,
        message: 'Failed to authenticate token. Make sure to include the ' +
          'token returned from /users call in the authorization header ' +
          ' as a Bearer token'
      });
      return;
    } else {
      req.username = decoded.username;
      req.orgname = decoded.orgName;
      logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
      return next();
    }
  });
});

var server = http.createServer(app).listen(8080, function() {
  console.log(`Server started on port: ${8080}`)
});
logger.info('****************** SERVER STARTED ************************');
//logger.info('***************  http://%s:%s  ******************', host, port);
server.timeout = 240000;

app.post('/users/login', async function(req, res) {
  var username = req.body.username;
  var orgName = req.body.orgName;
  logger.debug('End point : /users');
  logger.debug('User name : ' + username);
  logger.debug('Org name  : ' + orgName);
  if (!username) {
    res.json(getErrorMessage('\'username\''));
    return;
  }
  if (!orgName) {
    res.json(getErrorMessage('\'orgName\''));
    return;
  }

  var token = jwt.sign({
    exp: Math.floor(Date.now() / 1000) + parseInt(36000),
    username: username,
    orgName: orgName
  }, app.get('secret'));

  let isUserRegistered = await helper.isUserRegistered(username, orgName);

  if (isUserRegistered) {
    res.json({
      success: true,
      message: {
        token: token
      }
    });
  } else {
    res.json({
      success: false,
      message: `User with username ${username} is not registered with ${orgName}, Please register first.`
    });
  }
});

app.get('/api/query', async function(req, res) {
  //console.log(req.username);
  //console.log(req.orgname);
  try {
    let fcn = req.query.fcn;
    let args = req.query.args;
    args = args.replace(/'/g, '"');
    args = JSON.parse(args);
    let ccp = await helper.getCCP(req.orgname);
    let walletPath = await helper.getWalletPath(req.orgname);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    //console.log(`Wallet path: ${walletPath}`);
    const identity = await wallet.get(req.username);
    if (!identity) {
      console.log('An identity for the user does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      return;
    }
    const gateway = new Gateway();
    //console.log(req.username);
    //console.log(req.orgname);
    await gateway.connect(ccp, {
      wallet,
      identity: req.username,
      discovery: {
        enabled: true,
        asLocalhost: true
      }
    });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('awesome');
    let result;
    if (fcn == "queryService") {
      //console.log("is it at query service");
      result = await contract.evaluateTransaction('QueryContract:' + fcn, args[0]);
      //console.log("is it at query service");
      //console.log(result);
      //console.log("is it at query service");
    } else if (fcn == "queryAllServicesAsOwner") {
      result = await contract.evaluateTransaction('QueryContract:' + fcn);
    } else if (fcn == "queryServiceAsCustomer") {
      result = await contract.evaluateTransaction('QueryContract:' + fcn, args[0]);
    } else if (fcn == "queryServiceAsProvider") {
      result = await contract.evaluateTransaction('QueryContract:' + fcn, args[0]);
    } else if (fcn == "queryAllServicesAsCustomer") {
      result = await contract.evaluateTransaction('QueryContract:' + fcn);
    } else if (fcn == "queryAllServicesAsProvider") {
      result = await contract.evaluateTransaction('QueryContract:' + fcn);
    } else if (fcn == "queryAllSLAs") {
      result = await contract.evaluateTransaction('QueryContract:' + fcn);
    } else if (fcn == "queryAllSLAsAsWitness") {
      result = await contract.evaluateTransaction('QueryContract:' + fcn);
    } else if (fcn == "queryAllServices") {
      result = await contract.evaluateTransaction('QueryContract:' + fcn);
    } else if (fcn == "queryMySLAsAsWitness") {
      result = await contract.evaluateTransaction('QueryContract:' + fcn);
    } else if (fcn == "queryUserData") {
      result = await contract.evaluateTransaction('UserDataContract:' + fcn);
    }
    //console.log("is it at query");
    result = JSON.parse(result.toString());
    //console.log(result);
    //console.log("is it at query service");
    let message = result;
    const response_payload = {
      result: message,
      error: null,
      errorData: null
    }
    //console.log(response_payload);
    res.send(response_payload);
    await gateway.disconnect();
  } catch (error) {
    //console.log(error);
    const response_payload = {
      result: null,
      error: error.name,
      errorData: error.message
    }
    //console.log(response_payload);
    res.send(response_payload)
  }
});

app.post('/api/invoke', async function(req, res) {
  //console.log("invoke");
  //console.log(req.username);
  //console.log(req.orgname);
  try {
    let fcn = req.body.fcn;
    let args = req.body.args;
    //console.log(args);
    let ccp = await helper.getCCP(req.orgname);
    let walletPath = await helper.getWalletPath(req.orgname);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    //console.log(`Wallet path: ${walletPath}`);
    const identity = await wallet.get(req.username);
    if (!identity) {
      //console.log('An identity for the user does not exist in the wallet');
      //console.log('Run the registerUser.js application before retrying');
      return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: req.username,
      discovery: {
        enabled: true,
        asLocalhost: true
      }
    });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('awesome');
    let result;
    let identifier;
    let message;
    if (fcn == "submitAuction") {
      console.log("posting auction...");
      getAuctionID(async function(data) {
        //console.log("im arg 0");
        //console.log(args[0]);
        console.log(fcn);
        console.log(req.username);
        console.log(data);
        console.log(args[0]);
        result = await contract.submitTransaction('AuctionContract:' + fcn, req.username + "_" + data, args[0]);
        message = `Successfully submitted auction`;
        response(res, message);
        incrementAuctionID(data, args[0]);
      });
      await gateway.disconnect();
      return;
    } else if (fcn == "submitBid") {
      //console.log("submitting bid...");
      result = await contract.submitTransaction('AuctionContract:' + fcn, args[0], args[1]);
      //console.log("this is the bid result:");
      //console.log(JSON.parse(result));
      message = `Successfully submitted bid`;
    } else if (fcn == "decrementAuction") {
      result = await contract.submitTransaction('AuctionContract:' + fcn, args[0]);
      //console.log(JSON.parse(result));
      message = `Successfully decremented auction`;
    } else if (fcn == "endForwardAuction") {
      var slaID = "_" + args[0];
      result = await contract.submitTransaction(fcn, args[0], slaID);
      message = `Successfully ended auction`;
      //var now = new Date();
      //console.log(now);
      //removeAuction(args[0]);
    } else if (fcn == "endForwardDutchAuction") {
      //console.log("End Dutch auction invoked");
      var slaID = "_" + args[0];
      result = await contract.submitTransaction(fcn, args[0], slaID);
      message = `Successfully ended auction`;
    } else if (fcn == "endReverseDutchAuction") {
      //console.log("End Dutch auction invoked");
      var slaID = "_" + args[0];
      result = await contract.submitTransaction(fcn, args[0], slaID);
      message = `Successfully ended auction`;
    } else if (fcn == "endReverseAuction") {
      var slaID = "_" + args[0];
      result = await contract.submitTransaction(fcn, args[0], slaID);
      console.log(result);
      message = `Successfully ended auction`;
      //var now = new Date();
      //console.log(now);
      //removeAuction(args[0]);
    } else if (fcn == "endReverseAuction1") {
      var slaID = "_" + args[0];
      result = await contract.submitTransaction(fcn, args[0], slaID);
      console.log(result);
      message = `Successfully ended auction`;
      //var now = new Date();
      //console.log(now);
      //removeAuction(args[0]);
    } else if (fcn == "endReverseAuction2") {
      var slaID = "_" + args[0];
      result = await contract.submitTransaction(fcn, args[0], slaID);
      console.log(result);
      message = `Successfully ended auction`;
      //var now = new Date();
      //console.log(now);
      //removeAuction(args[0]);
    } else if (fcn == "decrementDutch") {
      result = await contract.submitTransaction('AuctionContract:' + fcn, args[0]);
      message = `Successfully decremented dutch`;
    } else if (fcn == "incrementDutch") {
      result = await contract.submitTransaction('AuctionContract:' + fcn, args[0]);
      message = `Successfully incremented dutch`;
    } else if (fcn == "loginWitness") {
      result = await contract.submitTransaction(fcn);
      message = `Successfully logged in witness`;
    } else if (fcn == "submitWitnessVote") {
      result = await contract.submitTransaction(fcn, args[0], parseInt(args[1]));
      message = `Successfully submitted vote`;
    } else if (fcn == "endSLA") {
      result = await contract.submitTransaction(fcn, args[0]);
      message = `Successfully ended SLA and paid out users`;
    } else if (fcn == "slaPayout") {
      result = await contract.submitTransaction(fcn, args[0]);
      message = `Successfully paid out SLA`;
    } else if (fcn == "addBalance") {
      result = await contract.submitTransaction('UserDataContract:' + fcn, args[0]);
      message = `Successfully changed funds`;
    } else if (fcn == "withdrawBalance") {
      result = await contract.submitTransaction('UserDataContract:' + fcn, args[0]);
      message = `Successfully changed funds`;
    }
    await gateway.disconnect();
    //console.log("disconnected invoke");
    response(res, message);
  } catch (error) {
    console.log("error is here!");
    console.log(error);
    const response_payload = {
      result: null,
      error: error.name,
      errorData: error.message
    }
    res.send(response_payload)
  }
});

function response(res, message) {
  console.log(message);
  let response = {
    message: message
  }
  const response_payload = {
    result: response,
    error: null,
    errorData: null
  }
  res.send(response_payload);
}

function jsonReader(filePath, cb) {
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}

function getAuctionID(callback) {
  jsonReader("./data.json", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    callback(data.aucID);
  });
}

function getData(callback) {
  jsonReader("./data.json", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    callback(data);
  });
}

function incrementAuctionID(identifier, arg) {
  console.log(identifier);
  identifier = "auction" + identifier;
  console.log(arg);
  jsonReader("./data.json", function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    data.aucID += 1;
    fs.writeFileSync("./data.json", JSON.stringify(data), err => {
      if (err) console.log("Error writing file:", err);
    });
  });
}

async function getContract() {
  try {
    let ccp = await helper.getCCP("org2");
    let walletPath = await helper.getWalletPath("org2");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    //console.log(`Wallet path: ${walletPath}`);
    const identity = await wallet.get("admin");
    if (!identity) {
      console.log('An identity for the user does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: {
        enabled: true,
        asLocalhost: true
      }
    });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('awesome');
    return contract;
  } catch (e) {
    console.error(`Failed to evaluate transaction: ${e}`);
    //process.exit(1);
  }
}

async function getActiveResources(contract) {
  let result = "";
  let message = "";
  try {
    result = await contract.evaluateTransaction("QueryContract:queryAllActiveAuctionsAndSLAs");
    result = JSON.parse(result);
    //console.log(result);
    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        //console.log(result[i]);
        //var now = new Date();
        if (result[i].Record.docType == 'auction') {
          var parsedAuctionObject = JSON.parse(result[i].Record.auctionObject);
          //console.log(parsedAuctionObject);
          /*if (parsedAuctionObject.auctionRules.auctionType == 'dutch') {
            console.log("found dutch");
            continue;
          }*/
          //console.log(parsedAuctionObject);
          //console.log("now deadline");
          var deadline = parsedAuctionObject.auctionRules.deadline;
          //console.log(deadline);
          //console.log("deadline "+deadline);
          var distance = await getDistance(deadline);
          if (distance < 0) {
            //console.log("ending auction " + result[i].Key);
            var slaID = "_" + result[i].Key;
            console.log("ending auction...");
            if (parsedAuctionObject.auctionRules.auctionDirection == 'forward') {
              await contract.submitTransaction("endForwardAuction", result[i].Key, slaID);
              await new Promise(resolve => setImmediate(resolve));
            } else if (parsedAuctionObject.auctionRules.auctionDirection == 'reverse') {
              await contract.submitTransaction("endReverseAuction", result[i].Key, slaID);
              await new Promise(resolve => setImmediate(resolve));
            }
          }
        } else if (result[i].Record.docType == 'sla') {
          var deadline = result[i].Record.auctionObject.service.witnessGlobalRules.slaDeadline;
          var distance = await getDistance(deadline);
          if (distance < 0) {
            //console.log("ending sla " + result[i].Key);
            await contract.submitTransaction("endSLA", result[i].Key);
            await new Promise(resolve => setImmediate(resolve));
          }
        }
      }
    } else {
      //console.log("Nothing posted");
    }
    return;
  } catch (e) {
    console.log(e);
    console.error(`Failed to evaluate transaction here: ${e}`);
  }
}

async function slaHandling(contract) {
  var now = new Date();
  //console.log(now);
  await getActiveResources(contract);
  await sleep(5000);
  var now2 = new Date();
  //console.log(now2);
  //console.log("done w SLAs");
  slaHandling(contract);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getDistance(deadline) {
  var now = new Date();
  var countDownDate = new Date(deadline);
  return countDownDate - now;
}

async function main() {
  let contract = await getContract();
  slaHandling(contract);
}
main();
