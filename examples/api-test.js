var HostelsAPI = require('../dist/HostelsAPI');
var api = new HostelsAPI({
  siteID: '2345',
  password: 'HOpert123@',
  debug: true
});

// debugging
// process.env.DEBUG = 'hostels*';

api.getHotelDescriptiveInfo('9272')
.then(function(result) {
  console.log(result);
})
.catch(function(err) {

});
