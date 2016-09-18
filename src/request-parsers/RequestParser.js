// @flow
import xml2js from 'xml2js';

export type RequestParserConfigType = {
  siteID: string,
  password: string,
  language: string,
  currency: string,
  debug: bool
};

const initialConfig = {
  debug: true,
  siteID: '',
  password: '',
  language: 'en',
  currency: 'USD'
};

// @TODO add echo token support
/**
 * This is base class for all requests.
 * It will provide basic structure for returning Hostels XML Request based on JSON data
 * @class RequestParser
 */
export default class RequestParser {

  _config: RequestParserConfigType;
  _data: any;

  /**
   * object constructor
   */
  constructor(config: Object, data: any) {
    this._config = Object.assign({}, initialConfig, config);
    this._data = data;
  }

  /**
   * Returns request name and version
   * @returns {string}
   */
  getMethodName(): string {
    return '';
  }

  /**
   * Returns POS field data for authentication
   * @returns {string}
   */
  getPOS(): string {
    const builder = new xml2js.Builder({
      rootName: 'POS',
      headless: true,
      renderOpts: {
        pretty: false
      }
    });
    return builder.buildObject({
      Source: {
        RequestorID: {
          $: {
            ID: this._config.siteID,
            MessagePassword: this._config.password
          }
        }
      }
    });
  }

  /**
   * Contains parsing logic for request data to xml body
   * @returns {string}
   */
  getRequestBody(): string {
    return '';
  }

  /**
   * Makes real xml request used directly by HTTP POST
   * @returns {string}
   */
  getRequest(): string {
    return '';
  }

  /**
   * Get environment setting
   * @returns {string}
   * @private
   */
  _getEnv(): string {
    return this._config.debug ? 'Test' : 'Production';
  }
}
