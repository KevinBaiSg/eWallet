import { observable, computed } from 'mobx';
import Web3 from "web3";

export default class Web3Store {
  @observable
  web3: Web3 = null;

  @observable
  latestBlock: number = 0;

  @observable
  gasPrice: number = 0;

  // @observable
  DefaultGasPrice: number = 64;

  // @observable
  DefaultGasLimit: number = 21000;

  DefaultChainId: number = 1;

  @computed
  get defaultGasLimit(): number {
    return this.DefaultGasLimit;
  };

  @computed
  get defaultGasPrice(): number {
    return this.DefaultGasPrice;
  };

  @computed
  get chainId(): number {
    return this.DefaultChainId;
  };
}
