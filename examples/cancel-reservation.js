var HostelsAPI = require('../dist/HostelsAPI');
var config = require('./config');
var api = new HostelsAPI(config);

// reference 11.7 in api book
api.cancelReservation({
  UniqueID: {
    ID: '9999999999'
  },
  CancelCode: 'wrong-cancel-code'
})
.then(function(result) {
  console.log(result);
})
.catch(function(err) {
  console.log(err);
});
