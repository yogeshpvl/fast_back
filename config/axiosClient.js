const axios = require('axios');

const axiosClient = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

module.exports = axiosClient;
