// @flow
import request from 'request';
import debug from 'debug';

import HotelDescriptiveInfoRequest from './requests/HotelDescriptiveInfoRequest';
import ResponseParser from './ResponseParser';

import type { HotelDescriptiveInfoType } from './requests/HotelDescriptiveInfoRequest';

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
  currency: string
};

const initialConfig = {
  siteID: '',
  password: '',
  language: 'en',
  currency: 'USD'
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
   * @property _log
   */
  _log: Function;

  /**
   * @method constructor
   * @param { Object } config - initial config
   */
  constructor(config: Object) {
    this._log = debug('hostels-api');
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
    this._log(`Making request to ${uri}`);
    // this._log(`${encodeURIComponent(requestXML)}`);
    return new Promise((resolve: Function, reject: Function) => {
      request.post({
        uri,
        form: {
          OTA_request: encodeURIComponent(requestXML)
        }
      }, (err: ?RequestErrorType, httpResp: RequestHttpResponseType, responseBody: string) => {
        if (err) {
          this._log(`Response error code ${err.code}`);
          this._log(responseBody);
          reject(responseBody);
        } else {
          this._log(`Response http status ${httpResp.statusCode}`);
          this._log(`Response result ${responseBody}`);
          ResponseParser.parseXML(responseBody)
          .then((result: Object) => {
            this._log(result);
            this._log(JSON.stringify(result));
            resolve(result);
          }).catch((error: Object) => {
            this._log(error);
            reject(err);
          });
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
    return 'http://52.44.44.21:5050/xml/xml.php';
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

    const req = new HotelDescriptiveInfoRequest(this.config, params.map(
      (code: string): HotelDescriptiveInfoType => ({ HotelCode: code })
    ));
    return this._call(req.getRequest());
  }
}
