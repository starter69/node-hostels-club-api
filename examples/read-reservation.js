var HostelsAPI = require('../dist/HostelsAPI');
var config = require('./config');
var api = new HostelsAPI(config);

// reference 11.6 in api book
api.readReservation({
  ID: '9999999999'
})
.then(function(result) {
  console.log(result);
})
.catch(function(err) {
  console.log(err);
});
