// @flow
import HotelDescriptiveInfoRequest from './requests/HotelDescriptiveInfoRequest';

export default class HostelsAPI {
  run() {
    const data = [{ HotelCode: 35 }];
    const req = new HotelDescriptiveInfoRequest({ siteID: '315', password: 'test' }, data);
    console.log(req.getRequest());
  }
}
