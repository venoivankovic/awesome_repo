var express = require('express')
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var net = require('net');
// set the view engine to ejs
app.set('view engine', 'ejs');

//homepage routes
var reg = require('./routes/homepageRoutes.js');
reg.getIndex(app);
reg.postRegistration(app);
reg.postLogin(app);
reg.getLogin(app);
reg.getRegistration(app);
//end homepage

//UI Provider
var prov = require('./routes/uiProviderRoutes.js');
prov.getProvider(app); //we need this
prov.getPostAuctionThankYou(app); //yes
prov.getProviderCard(app); //might need later
prov.getProviderCardInfo(app); // might need later
prov.getPostBidThankYou(app); //will need it later, rn very agnostic
prov.postFullBid(app); //-will need it later, might as well keep it
prov.getPostAuction(app); //yes
prov.postFullAuction(app); //yes
prov.getMyAuctions(app); //yes
prov.getMyAuctionsInfo(app);//yes
prov.getAuctionCard(app);//yes
prov.getAuctionCardInfo(app);//yes
prov.postEndAuction(app);
prov.getMySLAs(app);
prov.getMySLAsInfo(app);
prov.getTestApi(app);
prov.getslaCard(app);
prov.browseAuctions(app);
prov.biddingCard(app);
//end UI Provider

//UI customer
var cust = require('./routes/uiCustomerRoutes.js');
cust.getCustomer(app); //yes
cust.getPostAuctionThankYou(app); //yes
cust.postAuction(app); //yes
cust.getBrowseAuctions(app); //yes
cust.getBrowseAuctionsQuery(app); //yes
cust.getCustomerCard(app); //yes
cust.getCustomerCardInfo(app); // yes
cust.postFullBid(app); //yes
cust.getMySLAs(app);
cust.getMySLAsInfo(app);
cust.getslaCard(app);
cust.getMyAuctions(app);
cust.getAuctionCard(app);
//end UI customer

//UI witness
var witness = require('./routes/uiWitnessRoutes.js');
witness.getWitness(app);
witness.getMySLAs(app);
witness.getSLACard(app);
witness.getMonitoringCard(app);
witness.postAuctionThankYou(app);
//end UI witness

app.listen(process.argv[2]);
console.log(`Server is listening on port ${process.argv[2]}`);
