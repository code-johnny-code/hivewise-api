const express = require('express');
const { v4: uuidv4 } = require('uuid');
const recordRoutes = express.Router();
const dbo = require('../db/conn');

// H3 configuration
const h3 = require('h3-js');
const hexResolution = 7;

recordRoutes.route('/hives').get(async function (_req, res) {
  const dbConnect = dbo.getDb();
  dbConnect
    .collection('hives')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching hives!');
      } else {
        res.json(result);
      }
    });
});

recordRoutes.route('/hives/byHex/:hex').get(async function (_req, res) {
  const dbConnect = dbo.getDb();
  const { hex } = _req.params;
  dbConnect
    .collection('hives')
    .find({ 'hiveLoc.h3': hex })
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching hives');
      } else {
        res.json(result);
      }
    });
});

recordRoutes.route('/hives').post(function (req, res) {
  const dbConnect = dbo.getDb();
  const { lat, lon } = req.body.hiveLoc;
  const hiveDoc = {
    hiveId: uuidv4(),
    created: new Date(),
    hiveName: req.body.hiveName,
    hiveLoc: {
      lat: lat,
      lon: lon,
      h3: h3.geoToH3(lat, lon, hexResolution),
    },
  };

  dbConnect.collection('hives').insertOne(hiveDoc, function (err, result) {
    if (err) {
      res.status(400).send('Error inserting hive!');
    } else {
      console.log(`Added a new hive with id ${result.insertedId}`);
      res.status(201).send();
    }
  });
});

recordRoutes.route('/hives').delete((req, res) => {
  const dbConnect = dbo.getDb();
  const hiveQuery = { hiveId: req.body.hiveId };

  dbConnect.collection('hives').deleteOne(hiveQuery, function (err, _result) {
    if (err) {
      res.status(400).send(`Error deleting hive with id ${hiveQuery.hiveId}`);
    } else if (_result.result.n) {
      console.log('1 document deleted');
      res.sendStatus(204);
    } else {
      res.sendStatus(410);
    }
  });
});

module.exports = recordRoutes;
