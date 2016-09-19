var HostelsAPI = require('../dist/HostelsAPI');
var config = require('./config');
var api = new HostelsAPI(config);

// reference 11.4.5 in api book
api.getHotelAvailailability({
  StayDateRange: {
    Start: '2016-10-10',
    End: '2016-10-15'
  },
  HotelCode: '5255',
  RoomStayCandidates: [{
    RoomTypeCode: '1_66',
    Quantity: '1'
  }, {
    RoomTypeCode: '1_23',
    Quantity: '1'
  }]
})
.then(function(result) {
  console.log(result);
})
.catch(function(err) {
  console.log(err);
});
