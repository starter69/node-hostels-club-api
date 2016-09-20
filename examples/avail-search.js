var HostelsAPI = require('../dist/HostelsAPI');
var config = require('./config');
var api = new HostelsAPI(config);

// reference 11.4.1 in api book
api.getHotelAvailailability({
  StayDateRange: {
    Start: '2016-10-10',
    End: '2016-10-15',
    Duration: '6'
  },
  Address: {
    CountryCode: 'IT',
    CountryName: 'Italy',
    CityName: 'Venice'
  },
  SegmentCategoryCode: '2',
  PropertyClassCode: '20',
  OrderBy: 'rating' // 'rating' or 'price'
})
.then(function(result) {
  console.log(result);
})
.catch(function(err) {
  console.log(err);
});
