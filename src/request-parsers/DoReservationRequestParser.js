// @flow
import xml2js from 'xml2js';
import RequestParser from './RequestParser';

export type ConfirmDataType = {
  sharedtotal: string,
  privatetotal: string,
  currency: string,
  totale: string,
  p_dal: string,
  p_al: string,
  p_notti: string,
  tot_notti: string,
  id_str: string,
  chiave: string,
  pr_0: string
};

export type CustomerType = {
  Email: string,
  FirstName: string,
  LastName: string,
  CountryCode: string, // ISO CountryCode
  Gender: 'Male' | 'Female',
  TelephoneNumber?: string,
  EstimatedArrivalTime: string // ex. 9:00,23:00 should be between 9AM and 24AM
};

export type CreditCardInfoType = {
  CreditCardNumber: string,
  CreditCardType: string, // ex. VI
  CardHolderName?: string, // below API will implicitly use name of customer if this field is empty
  ExpiryDate: string, // ex. 0108 - Jan 2008, 0910 - September 2010
  CVV: string // cvv
};

export type DoReservationType = {
  ConfirmData: ConfirmDataType, // collected in avail-book api. Use what is returned from last API
  Customer: CustomerType,
  CreditCard: CreditCardInfoType,
  Comment?: string
};

export default class DoReservationRequestParser extends RequestParser {
  _data: DoReservationType;

  /**
   * Returns request name and version
   * @returns {string}
   */
  getMethodName(): string {
    return 'OTA_HotelResRQ';
  }

  /**
   * Contains parsing logic for request data to xml body
   * @returns {string}
   */
  getRequestBody(data: DoReservationType): string {
    const builder = new xml2js.Builder({ headless: true, renderOpts: { pretty: false } });
    return builder.buildObject({
      HotelReservations: { HotelReservation: {
        RoomStays: { RoomStay: { Guarantee: { GuaranteesAccepted: { GuaranteeAccepted: {
          PaymentCard: {
            $: {
              CardCode: data.CreditCard.CreditCardType,
              CardNumber: data.CreditCard.CreditCardNumber,
              ExpireDate: data.CreditCard.ExpiryDate,
              SeriesCode: data.CreditCard.CVV
            },
            CardHolderName: data.CreditCard.CardHolderName || `${data.Customer.FirstName} ${data.Customer.LastName}`
          }
        }}}}},
        ResGuests: { ResGuest: {
          $: { ArrivalTime: data.Customer.EstimatedArrivalTime },
          Profiles: { ProfileInfo: { Profile: { Customer: {
            $: { Gender: data.Customer.Gender },
            PersonName: {
              GivenName: data.Customer.FirstName,
              Surname: data.Customer.LastName,
            },
            TelephoneNumber: {
              $: { PhoneNumber: data.Customer.PhoneNumber || '' }
            },
            Email: data.Customer.Email,
            CitizenCountryName: {
              $: { Code: data.Customer.CountryCode }
            }
          }}}},
          Comments: {
            Text: data.Comment || ''
          }
        }},
        TPA_Extensions: {
          ConfirmData: {
            $: Object.assign({}, data.ConfirmData)
          }
        }
      }}
    });
  }

  /**
   * Makes real xml request used directly by HTTP POST
   * @returns {string}
   */
  getRequest(): string {
    const { language } = this._config;

    return `<?xml version="1.0" encoding="UTF-8"?>
      <OTA_HotelResRQ EchoToken="1" Target="${this._getEnv()}"
      Version="1.003"
      xmlns="http://www.opentravel.org/OTA/2003/05"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05
      OTA_HotelResRQ.xsd"  PrimaryLangID="${language}">
      ${this.getPOS()}
      ${this.getRequestBody(this._data)}
      </OTA_HotelResRQ>`;
  }
}
