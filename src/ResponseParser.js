// @flow
import xml2js from 'xml2js';

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
  static parseXML(xmlString: string): Promise<Object> {
    const parser = new xml2js.Parser({
      explicitRoot: false
    });
    return new Promise((resolve: Function, reject: Function) => {
      parser.parseString(xmlString, (err: ?Object, result: Object) => {
        if (err) {
          reject(err);
          return;
        }

        // omits root attributes for better read
        const returnValue = Object.assign({}, result);
        delete returnValue.$;
        resolve(returnValue);
      });
    });
  }
}
