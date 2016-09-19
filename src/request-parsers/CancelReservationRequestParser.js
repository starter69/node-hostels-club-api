// @flow
import xml2js from 'xml2js';
import RequestParser from './RequestParser';

export type UniqueIDType = {
  Type?: string,
  ID: string // indicates the reservation ID returned from DoReservation
};

export type CancelReservationType = {
  UniqueID: UniqueIDType,
  CancelCode: string,
  CancelType?: 'Initiate' | 'Ignore' | 'Commit' | 'Cancel' // default = 'Cancel'
};

export default class CancelReservationRequestParser extends RequestParser {
  _data: CancelReservationType;

  /**
   * Returns request name and version
   * @returns {string}
   */
  getMethodName(): string {
    return 'OTA_CancelRQ';
  }

  /**
   * Contains parsing logic for request data to xml body
   * @returns {string}
   */
  getRequestBody(data: CancelReservationType): string {
    const builder = new xml2js.Builder({ headless: true, renderOpts: { pretty: false } });
    return builder.buildObject({
      UniqueID: {
        $: Object.assign({}, data.UniqueID, { Type: '14' }) // 14 means read reservation confirmation
      },
      Verification: {
        TPA_Extensions: {
          CancelCode: {
            $: { Code: data.CancelCode }
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
      <OTA_CancelRQ EchoToken="1" Target="${this._getEnv()}"
      Version="1.001"
      xmlns="http://www.opentravel.org/OTA/2003/05"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05
      OTA_CancelRQ.xsd"  PrimaryLangID="${language}" CancelType="${this._data.CancelType || 'Cancel'}">
      ${this.getPOS()}
      ${this.getRequestBody(this._data)}
      </OTA_CancelRQ>`;
  }
}
