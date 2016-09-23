# node-hostels-club-api
NodeJs wrapper for hostels club xml API service

## Making build
- To make minified build, run `npm run build`
- For development and watch, run `npm run dev`

## Running examples
- Run `npm run dev` to make sure all source codes are transpiled correctly
- Set config in `examples/config.js`
- Run `DEBUG=hostels* node --filename--`

*Note*
> Set `debug` as true in config to use the API without whitelisting your IP at the moment.

## Folder structure

    .
    ├── dist                    # Compiled files
    ├── src                     # Source files
    │   ├── constants           # Contains constant values for some of the parameters. Just for reference only for now.
    │   ├── request-parsers     # Parser classes to parse JSON into XML for hostels API service
    │   ├── response-parsers    # Parser classes to parse XML response back to JSON
    │   ├── logger.js           # Basic logger class to log to console
    │   └── index.js            # Main library file
    ├── examples                # Examples for each library functions
    ├── LICENSE
    └── README.md

## API documentation
Refer to google drive doc

## Main Dependency
- [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)

## Contribution
The library is written in ES6.
We require flow types to be used to clarify better about each variable.
