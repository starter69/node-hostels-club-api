var HostelsAPI = require('../dist/HostelsAPI');
var config = require('./config');
var api = new HostelsAPI(config);

// reference 11.5 in api book
api.getHotelAvailailability({
  StayDateRange: {
    Start: '2016-10-10',
    End: '2016-10-15'
  },
  HotelCode: '5255',
  RoomStayCandidates: [{
    RoomTypeCode: '1_66',
    Quantity: '1'
  }]
})
.then(function(result) {
  var resParam = {
    // ConfirmData: Object.assign({}, result.TPA_Extensions[0].ConfirmData, { chiave: 'wrong-chiave' }),
    ConfirmData: result.TPA_Extensions[0].ConfirmData,
    Customer: {
      Email: 'james.bond@test.com',
      FirstName: 'James',
      LastName: 'Bond',
      CountryCode: 'US',
      Gender: 'Male',
      TelephoneNumber: '+11234567890',
      EstimatedArrivalTime: '09:00'
    },
    CreditCard: {
      CreditCardNumber: '4444444444441111',
      CreditCardType: 'VI',
      CardHolderName: 'James Bond',
      ExpiryDate: '0919',
      CVV: '123'
    },
    Comment: 'I want confirmation ASAP'
  };
  return api.doReservation(resParam);
})
.then(function(result) {
  console.log(JSON.stringify(result, null, 2));
})
.catch(function(err) {
  console.log(err);
});
