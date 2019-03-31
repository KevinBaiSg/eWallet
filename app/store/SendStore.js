import { observable, action } from 'mobx';
// import Logger from 'js-logger';
import BigNumber from "bignumber.js";
import EthereumjsUnits from "ethereumjs-units";
import type { Web3Instance } from 'store/app-state'
import Logger from 'utils/logger'

// Logger.useDefaults();
//
// if (process.env.NODE_ENV === 'development') {
//   Logger.setLevel(Logger.DEBUG);
// } else if (process.env.DEBUG_PROD === 'true') {
//   Logger.setLevel(Logger.INFO);
// } else {
//   Logger.setLevel(Logger.WARN);
// }

export default class SendStore {
  @observable
  feeLevels = null;

  @observable
  selectedFeeLevel = null;

  @action
  fetchFees(web3Instance: Web3Instance) {

  }

  getGasPrice(web3Instance: Web3Instance) {
    if (web3Instance && web3Instance.gasPrice) {
      return web3Instance.gasPrice;
    } else {
      return BigNumber(web3Instance.defaultGasPrice);
    }
  };

  static calculateFee(gasPrice: string, gasLimit: string): string {
    try {
      return EthereumjsUnits.convert(
        new BigNumber(gasPrice).times(gasLimit).toFixed(), 'gwei', 'ether');
    } catch (error) {
      return '0';
    }
  };

  static calculateTotal(amount: string, gasPrice: string, gasLimit: string): string {
    try {
      return new BigNumber(amount).plus(
        SendStore.calculateFee(gasPrice, gasLimit)).toFixed();
    } catch (error) {
      return '0';
    }
  };

  static calculateMaxAmount(balance: BigNumber, gasPrice: string, gasLimit: string): string {
    try {
      // TODO - minus pendings
      const fee = SendStore.calculateFee(gasPrice, gasLimit);
      const max = balance.minus(fee);
      if (max.lessThan(0)) return '0';
      return max.toFixed();
    } catch (error) {
      return '0';
    }
  };

  getFeeLevels(symbol: string,
               gasPrice: BigNumber | string,
               gasLimit: string): Array<FeeLevel> {
    const price: BigNumber = typeof gasPrice === 'string' ? new BigNumber(gasPrice) : gasPrice;
    const quarter: BigNumber = price.dividedBy(4);
    const high: string = price.plus(quarter.times(2)).toFixed();
    const low: string = price.minus(quarter.times(2)).toFixed();

    return [
      {
        value: 'High',
        gasPrice: high,
        label: `${this.calculateFee(high, gasLimit)} ${symbol}`,
      },
      {
        value: 'Normal',
        gasPrice: gasPrice.toString(),
        label: `${this.calculateFee(price.toFixed(), gasLimit)} ${symbol}`,
      },
      {
        value: 'Low',
        gasPrice: low,
        label: `${this.calculateFee(low, gasLimit)} ${symbol}`,
      },
    ];
  };
}
