const express = require('express');
const { v4: uuidv4 } = require('uuid');
const recordRoutes = express.Router();
const dbo = require('../db/conn');

recordRoutes.route('/catchers').get(async function (_req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('catchers')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching catchers');
      } else {
        res.json(result);
      }
    });
});

recordRoutes.route('/catchers/byHex/:hex').get(async function (_req, res) {
  const dbConnect = dbo.getDb();
  const {hex} = _req.params;
  dbConnect
    .collection('catchers')
    .find({"regions": hex})
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching catchers');
      } else {
        res.json(result);
      }
    });
});

recordRoutes.route('/catchers').post(function (req, res) {
  const dbConnect = dbo.getDb();
  const {userId, regions, notifyBy, schedule, maxHeight, cutout} = req.body;
  const catcherId = uuidv4();
  const catcherDoc = {
    userId: userId,
    catcherId: catcherId,
    created: new Date(),
    regions: regions,
    notifyBy: notifyBy,
    vacation: false,
    schedule: schedule,
    maxHeight: maxHeight,
    cutout: cutout
  }

  dbConnect
    .collection('users')
    .find({userId: userId})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching catchers');
      } else {
        if (result.length) {
          // TODO: There has to be a better way than this nested Mongo connection
          dbConnect
            .collection('catchers')
            .insertOne(catcherDoc, function (err) {
              if (err) {
                if (err.code === 11000) {
                  res.status(400).send('User already registered as a Catcher')
                } else {
                  res.status(400).send('Error inserting catcher');
                }
              } else {
                console.log(`Added catcher ${catcherId}`);
                res.status(204).send();
              }
            });
        } else {
          res.status(400).send('User not found')
        }
      }
    });
});

recordRoutes.route('/catchers').delete((req, res) => {
  const dbConnect = dbo.getDb();
  const catcherQuery = { catcherId: req.body.catcherId };

  dbConnect
    .collection('catchers')
    .deleteOne(catcherQuery, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting listing with id ${catcherQuery.userId}!`);
      }
      else if (_result.result.n) {
        console.log('Catcher document deleted');
        res.sendStatus(204);
      } else {
        res.sendStatus(410)
      }
    });
});

module.exports = recordRoutes;
