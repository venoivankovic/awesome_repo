const path = require('path');
const fs = require('fs');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
  extended: true
});
const {
  Gateway,
  Wallets
} = require('fabric-network');

module.exports = {
  getWitness: function(app) {
    app.get('/ui_witness/witness', function(req, res) {
      res.render('ui_witness/witness.ejs');
    })
  },
  getBrowseSLAs: function(app) {
    app.get('/ui_witness/browseSLAs', function(req, res) {
      res.render('ui_witness/browseSLAs.ejs');
    })
  },
  getMySLAs: function(app) {
    app.get('/ui_witness/mySLAs', function(req, res) {
      res.render('ui_witness/mySLAs.ejs');
    })
  },
  getSLACard: function(app) {
    app.get('/ui_witness/slaCard', function(req, res) {
      res.render('ui_witness/slaCard.ejs');
    })
  },
  getMonitoringCard: function(app) {
    app.get('/ui_witness/monitoringCard', function(req, res) {
      res.render('ui_witness/monitoringCard.ejs');
    })
  },
  postAuctionThankYou: function(app) {
    app.get('/ui_witness/postAuctionThankYou', function(req, res) {
      res.render('ui_witness/postAuctionThankYou.ejs');
    })
  }
}
