// @flow
import ResponseParser from './ResponseParser';
import type { ErrorObjectType } from '../index';

type HotelDescriptiveInfoResponseType = {
  OTA_HotelDescriptiveInfoRS: Object
};

export default class HotelDescriptiveInfoResponseParser extends ResponseParser {
  /**
   * Parses xml string into promise of JSON
   * @param {string} xmlString
   * @returns {Promise<Object>}
   * @static
   */
  parseXML(xmlString: string): Promise<Object> {
    return super.parseXML(xmlString)
      .then((result: HotelDescriptiveInfoResponseType): Promise<any> => {
        const errors: ?Array<ErrorObjectType> = this._checkDataErrors(result.OTA_HotelDescriptiveInfoRS);
        if (errors) {
          throw errors;
        }

        return this._prettifyJSON(result.OTA_HotelDescriptiveInfoRS.HotelDescriptiveContents)[0].HotelDescriptiveContent[0];
      });
  }
}
