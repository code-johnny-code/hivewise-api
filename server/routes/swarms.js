const express = require('express');
const { v4: uuidv4 } = require('uuid');
const recordRoutes = express.Router();
const dbo = require('../db/conn');

// H3 configuration
const h3 = require("h3-js");
const hexResolution = 7;

recordRoutes.route('/swarms').get(async function (_req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('swarms')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching swarms');
      } else {
        res.json(result);
      }
    });
});

recordRoutes.route('/swarms/byHex/:hex').get(async function (_req, res) {
  const dbConnect = dbo.getDb();
  const {hex} = _req.params;
  dbConnect
    .collection('swarms')
    .find({"swarmLoc.h3": hex})
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching swarms');
      } else {
        res.json(result);
      }
    });
});

recordRoutes.route('/swarms').post(function (req, res) {
  const dbConnect = dbo.getDb();
  const {lat, lon, z} = req.body.swarmLoc;
  const swarmDoc = {
    swarmId: uuidv4(),
    created: new Date(),
    activeSwarm: req.body.activeSwarm,
    firstSeen: req.body.firstSeen,
    swarmLoc: {
      lat: lat,
      lon: lon,
      z: z,
      h3: h3.geoToH3(lat, lon, hexResolution)
    },
    contact: req.body.contact
  }

  dbConnect
    .collection('swarms')
    .insertOne(swarmDoc, function (err, result) {
      if (err) {
        res.status(400).send('Error inserting swarm');
      } else {
        console.log(`Added a new swarm with id ${result.insertedId}`);
        res.status(204).send();
      }
    });
});

recordRoutes.route('/swarms/deactivate').put(function (req, res) {
  const dbConnect = dbo.getDb();
  const {swarmId} = req.body;
  const swarmDoc = {
    swarmId: swarmId,
  };

  dbConnect
    .collection('swarms')
    .updateOne(swarmDoc, {$set: {activeSwarm: false}}, function (err, result) {
      if (err) {
        res.status(400).send('Error deactivating swarm');
      } else {
        console.log(`Deactivated a swarm with id ${result.insertedId}`);
        res.status(204).send();
      }
    });
});

recordRoutes.route('/swarms').delete((req, res) => {
  const dbConnect = dbo.getDb();
  const swarmQuery = { swarmId: req.body.swarmId };

  dbConnect
    .collection('swarms')
    .deleteOne(swarmQuery, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting listing with id ${swarmQuery.swarmId}!`);
      }
      else if (_result.result.n) {
        console.log('1 document deleted');
        res.sendStatus(204);
      } else {
        res.sendStatus(410)
      }
    });
});

module.exports = recordRoutes;
