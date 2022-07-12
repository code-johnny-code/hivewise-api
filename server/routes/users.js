const express = require('express');
const { v4: uuidv4 } = require('uuid');
const recordRoutes = express.Router();
const dbo = require('../db/conn');

recordRoutes.route('/users').get(async function (_req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('users')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching users');
      } else {
        res.json(result);
      }
    });
});

recordRoutes.route('/users').post(function (req, res) {
  const dbConnect = dbo.getDb();
  const userId = uuidv4();
  const userDoc = {
    userId: userId,
    created: new Date(),
    name: req.body.name,
    email: req.body.email
  }

  dbConnect
    .collection('users')
    .insertOne(userDoc, function (err) {
      if (err) {
        res.status(400).send('Error inserting user');
      } else {
        console.log(`Added user ${userId}`);
        res.status(204).send();
      }
    });
});

recordRoutes.route('/users').delete((req, res) => {
  const dbConnect = dbo.getDb();
  const userQuery = { userId: req.body.userId };

  dbConnect
    .collection('users')
    .deleteOne(userQuery, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting listing with id ${userQuery.userId}!`);
      }
      else if (_result.result.n) {
        console.log('user document deleted');
        res.sendStatus(204);
      } else {
        res.sendStatus(410)
      }
    });
});

module.exports = recordRoutes;
