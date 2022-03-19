'use strict';

const fs = require('fs');
const path = require('path');
const apiserver = require('./../apiserver.js');

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

function getAuctionID() {
  jsonReader("./data.json", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("im being printed");
    console.log(data);
    apiserver.logAuctionID(data);
  });
}

function incrementAuctionID() {
  jsonReader("./data.json", function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    data.aucID += 1;
    //console.log(data.aucID);
    fs.writeFileSync("./data.json", JSON.stringify(data), err => {
      if (err) console.log("Error writing file:", err);
    }); // => "Infinity Loop Drive"
  });
}

function getSLAID() {
  jsonReader("./data.json", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    return data.slaID;
  });
}

function incrementSLAID() {
  jsonReader("./data.json", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    data.slaID += 1;
    console.log(data.slaID);
    fs.writeFile("./data.json", JSON.stringify(data), err => {
      if (err) console.log("Error writing file:", err);
    }); // => "Infinity Loop Drive"
  });
}

// add auction to auction Array
// add sla to sla Array
// read auction with ID
// read sla with ID

module.exports = {
  jsonReader: jsonReader,
  getAuctionID: getAuctionID,
  incrementAuctionID: incrementAuctionID,
  getSLAID: getSLAID,
  incrementSLAID: incrementSLAID
}
