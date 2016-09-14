var HostelsAPI = require('../dist/HostelsAPI');
var api = new HostelsAPI({
  siteID: '2345',
  password: 'HOpert123@'
});

api.getHotelDescriptiveInfo('9272')
.then(function(result) {

})
.catch(function(err) {

});
