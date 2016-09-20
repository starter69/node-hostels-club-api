// @flow
import RequestParser from './RequestParser';
import CriterionParser from './CriterionParser';

import type { RequestParserConfigType } from './RequestParser';
import type { CriterionParamsType } from './CriterionParser';

export type HotelSearchRequestParserConfigType = RequestParserConfigType & {
  limit: number,
  availableOnly: bool
};

const initialConfig = {
  limit: 100,
  availableOnly: true
};

export default class HotelSearchRequestParser extends RequestParser {
  _config: HotelSearchRequestParserConfigType;
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
    return 'OTA_HotelSearchRQ';
  }

  /**
   * Returns search request body
   * @returns {string}
   */
  getRequestBody(data: CriterionParamsType): string {
    const criterionParser: CriterionParser = new CriterionParser();
    return `<Criteria AvailableOnlyIndicator="${this._config.availableOnly}">
      ${criterionParser.generateXML(data)}
      </Criteria>`;
  }

  /**
   * Makes real xml request used directly by HTTP POST
   * @returns {string}
   */
  getRequest(): string {
    const { language } = this._config;

    // NOTE adding attributes to root element is not working at the moment.
    return `<?xml version="1.0" encoding="UTF-8"?>
      <OTA_HotelSearchRQ Target="${this._getEnv()}"
      xmlns="http://www.opentravel.org/OTA/2003/05"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05
      OTA_HotelSearchRQ.xsd"
      Version="1.003" MaxResponses="${this._config.limit}"
      PrimaryLangID="${language}">
      ${this.getPOS()}
      ${this.getRequestBody(this._data)}
      </OTA_HotelSearchRQ>`;
  }
}
