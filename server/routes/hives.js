const express = require('express');
const { v4: uuidv4 } = require('uuid');

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require('../db/conn');

// H3 configuration
const h3 = require("h3-js");
const hexResolution = 7;

// This section will help you get a list of all the records.
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

// This section will help you create a new record.
recordRoutes.route('/hives').post(function (req, res) {
  const dbConnect = dbo.getDb();
  const {lat, lon} = req.body.hiveLoc;
  const hiveDoc = {
    hiveId: uuidv4(),
    created: new Date(),
    hiveName: req.body.hiveName,
    hiveLoc: {
      lat: lat,
      lon: lon,
      h3: h3.geoToH3(lat, lon, hexResolution)
    }
  }

  dbConnect
    .collection('hives')
    .insertOne(hiveDoc, function (err, result) {
      if (err) {
        res.status(400).send('Error inserting hive!');
      } else {
        console.log(`Added a new hive with id ${result.insertedId}`);
        res.status(204).send();
      }
    });
});

// This section will help you update a record by id.
// recordRoutes.route('/listings/updateLike').post(function (req, res) {
//   const dbConnect = dbo.getDb();
//   const listingQuery = { _id: req.body.id };
//   const updates = {
//     $inc: {
//       likes: 1,
//     },
//   };
//
//   dbConnect
//     .collection('listingsAndReviews')
//     .updateOne(listingQuery, updates, function (err, _result) {
//       if (err) {
//         res
//           .status(400)
//           .send(`Error updating likes on listing with id ${listingQuery.id}!`);
//       } else {
//         console.log('1 document updated');
//       }
//     });
// });

// This section will help you delete a record.
recordRoutes.route('/hives').delete((req, res) => {
  const dbConnect = dbo.getDb();
  const hiveQuery = { hiveId: req.body.hiveId };
  dbConnect
    .collection('hives')
    .deleteOne(hiveQuery, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting listing with id ${listingQuery.listing_id}!`);
      } else {
        console.log('1 document deleted');
      }
    });
});

module.exports = recordRoutes;
