// @flow
import request from 'request';

import logger from './logger';
import HotelDescriptiveInfoRequestParser from './request-parsers/HotelDescriptiveInfoRequestParser';
import HotelAvailRequestParser from './request-parsers/HotelAvailRequestParser';
import DoReservationRequestParser from './request-parsers/DoReservationRequestParser';
import ReadReservationRequestParser from './request-parsers/ReadReservationRequestParser';
import CancelReservationRequestParser from './request-parsers/CancelReservationRequestParser';
import HotelSearchRequestParser from './request-parsers/HotelSearchRequestParser';

import ResponseParser from './response-parsers/ResponseParser';

import type { CriterionParamsType } from './request-parsers/CriterionParser';
import type { HotelDescriptiveInfoType } from './request-parsers/HotelDescriptiveInfoRequestParser';
import type { DoReservationType } from './request-parsers/DoReservationRequestParser';
import type { UniqueIDType } from './request-parsers/ReadReservationRequestParser';
import type { CancelReservationType } from './request-parsers/CancelReservationRequestParser';
import type { HotelSearchRequestParserConfigType } from './request-parsers/HotelSearchRequestParser';

type RequestErrorType = {
  code: string
};

type RequestHttpResponseType = {
  statusCode: number
};

type APIConfigType = {
  siteID: string,
  password: string,
  language: string,
  currency: string,
  debug: bool
};

type ErrorObjectType = {
  ErrorCode: string,
  TimeStamp: ?string,
  ErrorMessage: string,
  Status: ?string,
  ErrorType: ?string
};

const initialConfig = {
  siteID: '',
  password: '',
  language: 'en',
  currency: 'USD',
  debug: true
};

/**
 * Main library class for wrapping the api service
 * @class HostelsAPI
 */
export default class HostelsAPI {
  /**
   * @property config
   */
  config: APIConfigType;

  /**
   * @method constructor
   * @param { Object } config - initial config
   */
  constructor(config: Object) {
    this.setConfig(Object.assign({}, initialConfig, config));
  }

  /**
   * @method setConfig
   * @param { Object } config - new config to set
   */
  setConfig(config: Object) {
    this.config = Object.assign({}, this.config, config);
  }

  /**
   * Make call to api service
   * @param {string} requestXML
   * @returns Promise<any>
   * @private
   */
  _call(requestXML: string): Promise<any> {
    const uri: string = this._getAPIEndpoint();
    logger(`Making request to ${uri}`);
    // NOTE
    // encodeURIComponent returns malformed XML error
    // You should just change ampersands to proper code
    logger(`${requestXML}`);
    const requestData = requestXML.replace(/&/g, '%26');
    return new Promise((resolve: Function, reject: Function) => {
      request.post({
        uri,
        form: {
          OTA_request: requestData
        }
      }, (err: ?RequestErrorType, httpResp: RequestHttpResponseType, responseBody: string) => {
        logger(`Response result ${responseBody}`);
        if (err) {
          logger(`Response error code ${err.code}`);
          reject(responseBody);
        } else {
          logger(`Response http status ${httpResp.statusCode}`);
          resolve(responseBody);
        }
      });
    });
  }

  /**
   * Returns api endpoint of the hostels api service.
   * @returns {string}
   * @private
   */
  _getAPIEndpoint(): string {
    return this.config.debug ? 'http://52.44.44.21:5050/xml/xml.php' : 'https://www.hostelspoint.com/xml/xml.php';
  }

  /**
   * Retrives hotel descriptive info
   * @param {string} hotelCode
   * @return {Promise<any>}
   */
  getHotelDescriptiveInfo(hotelCode: string): Promise<any> {
    const params: Array<string> = [hotelCode];

    const req = new HotelDescriptiveInfoRequestParser(this.config, params.map(
      (code: string): HotelDescriptiveInfoType => ({ HotelCode: code })
    ));
    return this._call(req.getRequest())
      .then((responseXML: string): Promise<any> => {
        const resParser = new ResponseParser({ feature: 'HotelDescriptiveInfo' });
        return resParser.parseXML(responseXML);
      })
      .catch((err: ErrorObjectType) => {
        logger(err);
      });
  }

  /**
   * Returns hotel availability search result
   * @param {CriterionParamsType} criterion
   * @returns Promise<any>
   */
  getHotelAvailailability(criterion: CriterionParamsType): Promise<any> {
    const req = new HotelAvailRequestParser({ ...this.config, feature: 'Search' }, criterion);
    return this._call(req.getRequest())
      .then((responseXML: string): Promise<any> => {
        const resParser = new ResponseParser({ feature: 'HotelAvail' });
        return resParser.parseXML(responseXML);
      })
      .catch((err: ErrorObjectType) => {
        logger(err);
      });
  }

  /**
   * Search hotels with criteria
   * @param {CriterionParamsType} criterion
   * @param {HotelSearchRequestParserConfigType} config
   * @returns Promise<any>
   */
  searchHotels(criterion: CriterionParamsType, config: HotelSearchRequestParserConfigType): Promise<any> {
    const req = new HotelSearchRequestParser(Object.assign({}, this.config, config), criterion);
    return this._call(req.getRequest())
      .then((responseXML: string): Promise<any> => {
        const resParser = new ResponseParser({ feature: 'HotelSearch' });
        return resParser.parseXML(responseXML);
      })
      .catch((err: ErrorObjectType) => {
        logger(err);
      });
  }

  /**
   * Does hotel reservation with customer and credit card information
   * @param {DoReservationType} resData
   * @returns Promise<any>
   */
  doReservation(resData: DoReservationType): Promise<any> {
    const req = new DoReservationRequestParser(this.config, resData);
    return this._call(req.getRequest())
      .then((responseXML: string): Promise<any> => {
        const resParser = new ResponseParser({ feature: 'HotelRes' });
        return resParser.parseXML(responseXML);
      })
      .catch((err: ErrorObjectType) => {
        logger(err);
      });
  }

  /**
   * Read the reservation which was made already
   * @param {UniqueIDType} resData
   * @returns Promise<any>
   */
  readReservation(data: UniqueIDType): Promise<any> {
    const req = new ReadReservationRequestParser(this.config, data);
    return this._call(req.getRequest())
      .then((responseXML: string): Promise<any> => {
        const resParser = new ResponseParser({ feature: 'ResRetrieve' });
        return resParser.parseXML(responseXML);
      })
      .catch((err: ErrorObjectType) => {
        logger(err);
      });
  }

  /**
   * Cancels the reservation which was made already
   * @param {CancelReservationType} cancelData
   * @returns Promise<any>
   */
  cancelReservation(cancelData: CancelReservationType): Promise<any> {
    const req = new CancelReservationRequestParser(this.config, cancelData);
    return this._call(req.getRequest())
      .then((responseXML: string): Promise<any> => {
        const resParser = new ResponseParser({ feature: 'Cancel' });
        return resParser.parseXML(responseXML);
      })
      .catch((err: ErrorObjectType) => {
        logger(err);
      });
  }
}
