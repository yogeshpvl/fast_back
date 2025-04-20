// utils/generateEntityId.js
const { v4: uuidv4 } = require('uuid');

function generateEntityId() {
  return "ENT" + uuidv4().replace(/-/g, "").substring(0, 5).toUpperCase();
}

module.exports = generateEntityId;
