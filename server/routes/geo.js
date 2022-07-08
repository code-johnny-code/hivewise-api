const express = require('express');
const recordRoutes = express.Router();
const {h3ToGeoBoundary, h3ToGeo} = require("h3-js");

recordRoutes.route('/geo/hex/boundary/:hex').get(async function (_req, res) {
  const {hex} = _req.params;
  const hexGeometry = h3ToGeoBoundary(hex, true);
  res.status(200).send(hexGeometry);
});

recordRoutes.route('/geo/hex/centroid/:hex').get(async function (_req, res) {
  const {hex} = _req.params;
  const hexCentroid = h3ToGeo(hex);
  res.status(200).send(hexCentroid);
});

module.exports = recordRoutes;
