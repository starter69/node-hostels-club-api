// @flow
import xml2js from 'xml2js';
import type { ErrorObjectType } from '../index';

/**
 * Parses xml response from hostels club API into JSON
 * @class ResponseParser
 */
export default class ResponseParser {
  /**
   * Parses xml string into promise of JSON
   * @param {string} xmlString
   * @returns {Promise<Object>}
   * @static
   */
  parseXML(xmlString: string): Promise<Object> {
    const parser = new xml2js.Parser({});
    return new Promise((resolve: Function, reject: Function) => {
      parser.parseString(xmlString, (err: ?Object, result: Object) => {
        if (err) {
          reject(err);
          return;
        }

        const errorObj: ?ErrorObjectType = this._parseHighLevelErrors(result);
        if (errorObj) {
          reject(errorObj);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * checks if error occurred on high level and returns error object if any
   * high level means before checking real data here (malformed, authentication etc)
   * @param {Object} result
   * @returns {?ErrorObjectType}
   * @private
   */
  _parseHighLevelErrors(result: Object): ?ErrorObjectType {
    if (result.OTA_ErrorRS) {
      const {
        ErrorCode,
        TimeStamp,
        ErrorMessage,
        Status
      } = result.OTA_ErrorRS.$;

      return {
        ErrorCode,
        TimeStamp,
        ErrorMessage,
        Status,
        ErrorType: '0'
      };
    }
    return false;
  }

  /**
   * checks if any error presents in data. i.e; no HotelCode, insufficient data etc.
   * @param {Object} result
   * @returns {?ErrorObjectType}
   */
  _checkDataErrors(result: Object): ?ErrorObjectType {
    if (result.Errors) {
      return result.Errors.map((error: Object): ErrorObjectType => ({
        ErrorCode: error.$.ErrorCode,
        ErrorType: error.$.ErrorType,
        ErrorMessage: error._
      }));
    }
    return false;
  }
}
