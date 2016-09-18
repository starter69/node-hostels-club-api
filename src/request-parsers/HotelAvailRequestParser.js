// @flow
import RequestParser from './RequestParser';
import CriterionParser from './CriterionParser';

import type { RequestParserConfigType } from './RequestParser';
import type { CriterionParamsType } from './CriterionParser';

export type HotelAvailRequestParserConfigType = RequestParserConfigType & {
  feature: string
};

const initialConfig = {
  feature: 'Search'
};

export default class HotelAvailRequestParser extends RequestParser {
  _config: HotelAvailRequestParserConfigType;
  _data: any;

  /**
   * object constructor
   */
  constructor(config: Object, data: any) {
    super(Object.assign({}, initialConfig, config), data);
  }

  /**
   * Returns request name and version
   * @returns {string}
   */
  getMethodName(): string {
    return 'OTA_HotelAvailRQ';
  }

  /**
   * Returns search request body
   * @returns {string}
   */
  getSearchRequestBody(data: CriterionParamsType): string {
    const criterionParser: CriterionParser = new CriterionParser();
    return `<AvailRequestSegments>
      <AvailRequestSegment>
      <HotelSearchCriteria>
      ${criterionParser.generateXML(data)}
      </HotelSearchCriteria>
      </AvailRequestSegment>
      </AvailRequestSegments>`;
  }

  /**
   * Makes real xml request used directly by HTTP POST
   * @returns {string}
   */
  getRequest(): string {
    const { language, currency } = this._config;

    // NOTE adding attributes to root element is not working at the moment.
    return `<?xml version="1.0" encoding="UTF-8"?>
      <OTA_HotelAvailRQ Target="${this._getEnv()}"
      xmlns="http://www.opentravel.org/OTA/2003/05"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05
      OTA_HotelAvailRQ.xsd"
      Version="1.006" RequestedCurrency="${currency}" AllowPartialAvail="false"
      PrimaryLangID="${language}">
      ${this.getPOS()}
      ${this[`get${this._config.feature}RequestBody`](this._data)}
      </OTA_HotelAvailRQ>`;
  }
}
