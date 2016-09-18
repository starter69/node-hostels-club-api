// @flow
import xml2js from 'xml2js';
import RequestParser from './RequestParser';

import type { RequestParserConfigType } from './RequestParser';

export type HotelDescriptiveInfoType = {
  HotelCode: string
};

export type HotelDescriptiveInfoRequestParserConfigType = RequestParserConfigType & {
  containHotelInfo: bool,
  containFacilityInfo: bool,
  containPolicies: bool,
  containContactInfo: bool,
  containMultimediaObjects: bool,
  containCustomerRatings: bool,
  containCustomerReviews: bool
};

const initialConfig = {
  containHotelInfo: true,
  containFacilityInfo: true,
  containPolicies: true,
  containContactInfo: true,
  containMultimediaObjects: true,
  containCustomerRatings: true,
  containCustomerReviews: true
};

export default class HotelDescriptiveInfoRequestParser extends RequestParser {
  _config: HotelDescriptiveInfoRequestParserConfigType;
  _data: Array<HotelDescriptiveInfoType>;

  /**
   * object constructor
   */
  constructor(config: Object, data: Array<HotelDescriptiveInfoType>) {
    super(Object.assign({}, initialConfig, config), data);
  }

  /**
   * Returns XMLBuilder compatible object from request data
   * @private
   * @param {HotelDescriptiveInfoRequestParserType} req
   * @returns {Object}
   */
  _makeHotelInfo(req: HotelDescriptiveInfoType): Object {
    const config = this._config;
    const contentInfo = [];
    if (config.containCustomerRatings) {
      contentInfo.push({
        $: { Name: 'CustomerRatings' }
      });
    }

    if (config.containCustomerReviews) {
      contentInfo.push({
        $: { Name: 'CustomerReviews' }
      });
    }

    return {
      $: {
        HotelCode: req.HotelCode
      },
      HotelInfo: { $: { SendData: config.containHotelInfo } },
      FacilityInfo: { $: { SendGuestRooms: config.containFacilityInfo } },
      Policies: { $: { SendPolicies: config.containPolicies } },
      ContactInfo: { $: { SendData: config.containHotelInfo } },
      MultimediaObjects: { $: { SendData: config.containMultimediaObjects } },
      ContentInfos: {
        ContentInfo: contentInfo
      }
    };
  }

  /**
   * Returns request name and version
   * @returns {string}
   */
  getMethodName(): string {
    return 'OTA_HotelDescriptiveInfoRQ';
  }

  /**
   * Contains parsing logic for request data to xml body
   * @returns {string}
   */
  getRequestBody(data: Array<HotelDescriptiveInfoType>): string {
    const builder = new xml2js.Builder({ headless: true, renderOpts: { pretty: false } });
    return builder.buildObject({
      HotelDescriptiveInfos: {
        HotelDescriptiveInfo: data.map(this._makeHotelInfo.bind(this))
      }
    });
  }

  /**
   * Makes real xml request used directly by HTTP POST
   * @returns {string}
   */
  getRequest(): string {
    const { language } = this._config;

    // NOTE adding attributes to root element is not working at the moment.
    return `<?xml version="1.0" encoding="UTF-8"?>
      <OTA_HotelDescriptiveInfoRQ EchoToken="1" Target="${this._getEnv()}"
      Version="1.002"
      xmlns="http://www.opentravel.org/OTA/2003/05"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05
      OTA_HotelDescriptiveInfoRQ.xsd"  PrimaryLangID="${language}">
      ${this.getPOS()}
      ${this.getRequestBody(this._data)}
      </OTA_HotelDescriptiveInfoRQ>`;
  }
}
