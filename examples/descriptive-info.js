var HostelsAPI = require('../dist/HostelsAPI');
var config = require('./config');
var api = new HostelsAPI(config);

// reference 11.3.1 in api book
api.getHotelDescriptiveInfo('9272')
.then(function(result) {
  console.log(result);
})
.catch(function(err) {

});
