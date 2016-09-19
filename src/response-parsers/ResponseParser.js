// @flow
import xml2js from 'xml2js';
import type { ErrorObjectType } from '../index';

export type ResponseParserConfigType = {
  feature: ?string
};

const initialConfig = {
  feature: ''
};

/**
 * Parses xml response from hostels club API into JSON
 * @class ResponseParser
 */
export default class ResponseParser {
  _config: ResponseParserConfigType;

  /**
   * object constructor
   */
  constructor(config: Object) {
    this._config = Object.assign({}, initialConfig, config);
  }

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
        const method: string = this.getMethodName();
        if (errorObj) {
          reject(errorObj);
        } else {
          const prettifiedResult = this._prettifyJSON(result[method]);
          const errors: ?Array<ErrorObjectType> = this._checkDataErrors(prettifiedResult);
          if (errors) {
            reject(errors);
            return;
          }

          const warnings: ?Array<ErrorObjectType> = this._checkWarnings(prettifiedResult);
          if (warnings) {
            reject(warnings);
            return;
          }

          delete prettifiedResult.xmlns;
          delete prettifiedResult['xmlns:xsi'];
          delete prettifiedResult['xsi:schemaLocation'];

          resolve(prettifiedResult);
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
        ErrorCode: error.Error.Code,
        ErrorType: error.Error.Type,
        ErrorMessage: error.Error.value
      }));
    }
    return false;
  }

  /**
   * checks if any warnings received. It will be treated as error as well because it is not processed.
   * @param {Object} result
   * @returns {?ErrorObjectType}
   */
  _checkWarnings(result: Object): ?ErrorObjectType {
    if (result.Warnings) {
      return result.Warnings.map((error: Object): ErrorObjectType => ({
        ErrorCode: error.Warning.Code,
        ErrorType: error.Warning.Type,
        ErrorMessage: error.Warning.value
      }));
    }
    return false;
  }

  /**
   * recursively prettifies the json result from xml parser (manages attributes and text nodes)
   * @param {any
   * @returns {any}
   */
  _prettifyJSON(data: any): any {
    // if it is array, it doesn't have keys. instead it has children
    if (data instanceof Array) {
      // handles case of only child is being array
      if (data.length === 1) {
        const {
          _, // eslint-disable-line no-unused-vars
          $, // eslint-disable-line no-unused-vars
          ...otherKeys
        } = data[0];
        if (!Object.keys(otherKeys).length) {
          return this._prettifyJSON(data[0]);
        }
      }

      return data.map((item: any): any => {
        const prettifiedItem = this._prettifyJSON(item);

        // if (typeof prettifiedItem === 'object' && !(prettifiedItem instanceof Array)) {
        //   const keys = Object.keys(prettifiedItem);
        //   if (keys.length === 1) {
        //      return prettifiedItem[keys[0]];
        //   }
        // }
        return prettifiedItem;
      });
    }

    if (typeof data === 'string') {
      return data;
    }

    const {
      $,
      ...otherChildNodes
    } = data;

    const otherKeys: Array<string> = Object.keys(otherChildNodes);
    const result = {
      ...$
    };

    for (let i: number = 0; i < otherKeys.length; i += 1) {
      const key: string = otherKeys[i] === '_' ? 'value' : otherKeys[i];
      result[key] = this._prettifyJSON(otherChildNodes[otherKeys[i]]);
    }

    return result;
  }

  /**
   * returns method name
   * @returns {string}
   */
  getMethodName(): string {
    return `OTA_${this._config.feature}RS`;
  }
}
