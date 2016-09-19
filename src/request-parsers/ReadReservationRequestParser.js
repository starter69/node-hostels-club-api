// @flow
import xml2js from 'xml2js';
import RequestParser from './RequestParser';

export type UniqueIDType = {
  Type?: string,
  ID: string // indicates the reservation ID returned from DoReservation
};

export default class ReadReservationRequestParser extends RequestParser {
  _data: UniqueIDType;

  /**
   * Returns request name and version
   * @returns {string}
   */
  getMethodName(): string {
    return 'OTA_ReadRQ';
  }

  /**
   * Contains parsing logic for request data to xml body
   * @returns {string}
   */
  getRequestBody(data: UniqueIDType): string {
    const builder = new xml2js.Builder({ headless: true, renderOpts: { pretty: false } });
    return builder.buildObject({
      ReadRequests: {
        ReadRequest: {
          UniqueID: {
            $: Object.assign({}, data, { Type: '14' }) // 14 means read reservation confirmation
          }
        }
      }
    });
  }

  /**
   * Makes real xml request used directly by HTTP POST
   * @returns {string}
   */
  getRequest(): string {
    const { language } = this._config;

    return `<?xml version="1.0" encoding="UTF-8"?>
      <OTA_ReadRQ EchoToken="1" Target="${this._getEnv()}"
      Version="1.006"
      xmlns="http://www.opentravel.org/OTA/2003/05"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05
      OTA_ReadRQ.xsd"  PrimaryLangID="${language}">
      ${this.getPOS()}
      ${this.getRequestBody(this._data)}
      </OTA_ReadRQ>`;
  }
}
