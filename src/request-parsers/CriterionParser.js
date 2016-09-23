// @flow
import xml2js from 'xml2js';

export type AddressType = {
  CountryName?: ?string,
  CountryCode: string,
  CityName: string,
  StateCode?: string,
  StateName?: string
};

export type StayDateRangeType = {
  Start: string,
  End: ?string, // optional
  Duration?: string // optional
};

export type RoomStayCandidateType = {
  RoomTypeCode: string,
  Quantity: string
};

export type CriterionParamsType = {
  StayDateRange?: StayDateRangeType,
  Address?: AddressType,
  HotelCityCode?: ?string, // this will be used if address is not set. can be found in affiliate appendix
  SegmentCategoryCode?: string,
  PropertyClassCode?: string,
  HotelCode?: string,
  RoomStayCandidates?: Array<RoomStayCandidateType>,
  OrderBy: 'rating' | 'price'
};

/**
 * This class has logic for generating criterion xml which is used in many types of requests
 * @class CriterionParser
 */
export default class CriterionParser {
  /**
   * Generate criterion xml which will be used in derived classes
   * @param {CriterionParamsType} data
   * @returns {string} xml
   */
  generateXML(data: CriterionParamsType): string {
    const builderJSON: Object = {
      HotelRef: {
        $: Object.assign({},
          data.SegmentCategoryCode ? { SegmentCategoryCode: data.SegmentCategoryCode } : {},
          data.PropertyClassCode ? { PropertyClassCode: data.PropertyClassCode } : {},
          data.HotelCode ? { HotelCode: data.HotelCode } : {}
        )
      }
    };

    // form stay date range
    if (data.StayDateRange) {
      builderJSON.StayDateRange = {
        $: Object.assign({}, // this is used not to have undefined property which generates error on xml2js
          { Start: data.StayDateRange.Start },
          data.StayDateRange.End ? { End: data.StayDateRange.End } : {},
          data.StayDateRange.Duration ? { Duration: `P${data.StayDateRange.Duration}N` } : {}
        )
      };
    }

    // form address data
    if (data.Address) {
      builderJSON.Address = {
        CountryName: {
          $: { Code: data.Address.CountryCode },
          _: data.Address.CountryName
        },
        CityName: data.Address.CityName
      };

      if (data.Address.StateCode || data.Address.StateName) {
        builderJSON.Address = {
          ...builderJSON.Address,
          StateProv: {
            $: { StateCode: data.Address.StateCode },
            _: data.Address.StateCode
          }
        };
      }
    }

    // form room candidate
    if (data.RoomStayCandidates) {
      builderJSON.RoomStayCandidates = {
        RoomStayCandidate: data.RoomStayCandidates.map((r: RoomStayCandidateType): Object => (
          {
            $: {
              RoomTypeCode: r.RoomTypeCode,
              Quantity: r.Quantity
            }
          }
        ))
      };
    }

    // form orderby data
    if (data.OrderBy) {
      builderJSON.TPA_Extensions = {
        OrderBy: {
          $: {
            Value: data.OrderBy
          }
        }
      };
    }

    const builder = new xml2js.Builder({ headless: true, renderOpts: { pretty: false } });
    return builder.buildObject({
      Criterion: builderJSON
    });
  }
}
