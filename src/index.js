// @flow
import request from 'request';

import logger from './logger';
import HotelDescriptiveInfoRequestParser from './request-parsers/HotelDescriptiveInfoRequestParser';
import HotelDescriptiveInfoResponseParser from './response-parsers/HotelDescriptiveInfoResponseParser';

import type { HotelDescriptiveInfoType } from './request-parsers/HotelDescriptiveInfoRequestParser';

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
   */
  getHotelDescriptiveInfo(hotelCode: Array<string> | string): Promise<any> {
    const params: Array<string> = [];
    if (typeof hotelCode === 'string') {
      params.push(hotelCode);
    } else {
      params.push(...hotelCode);
    }

    const req = new HotelDescriptiveInfoRequestParser(this.config, params.map(
      (code: string): HotelDescriptiveInfoType => ({ HotelCode: code })
    ));
    return this._call(req.getRequest())
      .then((responseXML: string): Promise<any> => {
        const resParser = new HotelDescriptiveInfoResponseParser();
        return resParser.parseXML(responseXML);
      })
      .then((result: Object) => {
        logger(result);
      })
      .catch((err: ErrorObjectType) => {
        logger(err);
      });
  }
}
