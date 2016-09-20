var HostelsAPI = require('../dist/HostelsAPI');
var config = require('./config');
var api = new HostelsAPI(config);

// reference 11.2 in api book
api.searchHotels({
  Address: {
    CountryCode: 'IT',
    CountryName: 'Italy',
    CityName: 'Venice'
  },
  SegmentCategoryCode: '2',
  PropertyClassCode: '20',
  OrderBy: 'rating'
}, {
  limit: 2,
  availableOnly: true // @TODO fix typo
})
.then(function(result) {
  console.log(result);
})
.catch(function(err) {
  console.log(err);
});
