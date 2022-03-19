'use strict';

var testObject = {
      "auctionObject": {
        "auctionRules": {
          "auctionDirection": "forward",
          "auctionType": "english",
          "deadline": "2022-01-25T23:47:04",
          "pricing": {
            "biddingStep": "",
            "pricingReserve": "",
            "startPrice": ""
          }
        },
        "service": {
          "commodity": {
            "docType": "vmInstance",
            "properties": [{
              "commodityKey": "os",
              "commodityValue": "Ubuntu 18.04"
            }]
          },
          "pricing": {
            "pricingSubscription": "flatFee"
          },
          "sloRulesAndFines": [{
            "ruleCondition": "We can ssh into the vm",
            "ruleFine": "100",
            "ruleIdentifier": "VM availability",
            "sloDeadline": "2022-01-25T22:49:55.911Z",
            "sloVotingBuckets": [
              ["x509::/OU=org2/OU=client/OU=department1/CN=witness1::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com", "x509::/OU=org2/OU=client/OU=department1/CN=witness2::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com"],
              ["x509::/OU=org2/OU=client/OU=department1/CN=witness1::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com", "x509::/OU=org2/OU=client/OU=department1/CN=witness2::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com"]
            ],
            "sloWitnessConfig": {
              "punishmentNoViolation": "20",
              "punishmentViolation": "15",
              "rewardNoViolation": "10",
              "rewardViolation": "5",
              "tPeriod": {
                "hours": "0",
                "minutes": "0",
                "seconds": "45"
              }
            },
            "showSLARule": true,
            "showSLARuleButton": true
          }, {
            "ruleCondition": "Less than 3 s",
            "ruleFine": "50",
            "ruleIdentifier": "VM latency",
            "sloDeadline": "2022-01-25T22:49:41.576Z",
            "sloVotingBuckets": [
              ["x509::/OU=org2/OU=client/OU=department1/CN=witness1::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com"],
              ["x509::/OU=org2/OU=client/OU=department1/CN=witness1::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com"]
            ],
            "sloWitnessConfig": {
              "punishmentNoViolation": "40",
              "punishmentViolation": "35",
              "rewardNoViolation": "30",
              "rewardViolation": "25",
              "tPeriod": {
                "hours": "0",
                "minutes": "0",
                "seconds": "45"
              }
            },
            "showSLARule": true,
            "showSLARuleButton": true
          }],
          "witnessGlobalRules": {
            "cFee": "50",
            "m": "2",
            "n": "3",
            "pFee": "50",
            "slaDeadline": "2022-01-25T23:50:08.911Z",
            "witnessGamePeriod": {
              "days": "0",
              "hours": "1",
              "minutes": "3",
              "seconds": "0"
            }
          }
        }
      },
      "biggestBid": {
        "auctionID": "",
        "owner": "x509::/OU=org2/OU=client/OU=department1/CN=customer1::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com",
        "pricing": {
          "bidAmount": "25",
          "pricingSubscription": "flatFee"
        }
      },
      "customer": "x509::/OU=org2/OU=client/OU=department1/CN=customer1::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com",
      "docType": "sla",
      "ended": true,
      "provider": "x509::/OU=org1/OU=client/OU=department1/CN=provider1::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com",
      "witnesses": [{
        "state": "offline",
        "witnessID": "x509::/OU=org2/OU=client/OU=department1/CN=witness3::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com"
      }, {
        "state": "offline",
        "witnessID": "x509::/OU=org2/OU=client/OU=department1/CN=witness1::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com"
      }, {
        "state": "offline",
        "witnessID": "x509::/OU=org2/OU=client/OU=department1/CN=witness2::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com"
      }]
    }

    async function main() {
      var n = 10;
      var arr = [{
          "hi": 1
        }, {
          "hi": 2
        }, {
          "hi": 3
        }, {
          "hi": 4
        }, {
          "hi": 5
        },
        {
          "hi": 6
        }, {
          "hi": 7
        }, {
          "hi": 8
        }, {
          "hi": 9
        }, {
          "hi": 10
        }, {
          "hi": 11
        }
      ];
      var printme = await getRandomWitnesses(arr, n);
      console.log(printme);
    }

    async function getRandomWitnesses(arr, n) {
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

    async function endSLA(sla) {
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
            userPayouts = await sloViolated(slo, bucket, userPayouts);
          } else if (bucket.length < witnessGlobalRules.m) {
            //console.log(i+" "+bucket+" not violated");
            userPayouts = await sloNotViolated(slo, bucket, userPayouts);
          }
        }
      }
      userPayouts.customer.payout = parseFloat(userPayouts.customer.payout) - (parseFloat(sla.auctionObject.service.witnessGlobalRules.cFee) * 0.01 * parseFloat(userPayouts.totalReward));
      userPayouts.provider.payout = parseFloat(userPayouts.provider.payout) - (parseFloat(sla.auctionObject.service.witnessGlobalRules.pFee) * 0.01 * parseFloat(userPayouts.totalReward));
      console.log(userPayouts);
    }

    async function sloViolated(slo, bucket, userPayouts) {
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

    async function sloNotViolated(slo, bucket, userPayouts) {
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

    //main();
    endSLA(testObject);
    console.log(parseFloat(-6) + parseFloat(5) + parseFloat(-7));
    //slaPayout(sla);
