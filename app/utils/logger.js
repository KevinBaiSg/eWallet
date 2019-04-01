/* @flow */
import Logger from "js-logger";

Logger.useDefaults();

if (process.env.NODE_ENV === 'development') {
  Logger.setLevel(Logger.DEBUG);
} else if (process.env.DEBUG_PROD === 'true') {
  Logger.setLevel(Logger.INFO);
} else {
  Logger.setLevel(Logger.WARN);
}

export default Logger;
