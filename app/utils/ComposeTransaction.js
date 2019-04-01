/* @flow */

import * as bitcoin from 'bitcoinjs-lib-zcash';
import type { Session as TrezorSession } from 'trezor.js';
import * as trezor from 'utils/types/trezor';
import * as hdnodeUtils from 'utils/hdnode';
import { create as createDeferred } from 'utils/deferred';
import Discovery from 'utils/helpers/Discovery';
import {
  getBitcoinNetwork,
  fixCoinInfoNetwork
} from 'utils/data/CoinInfo';
import { validateParams } from 'utils/helpers/paramsValidator';
import { formatAmount } from 'utils/formatUtils';
import { NO_COIN_INFO } from 'constants/errors';

import BlockBook, { create as createBackend } from 'utils/backend';
import Account, { create as createAccount } from 'utils/account';
import TransactionComposer from 'utils/tx/TransactionComposer';
import {
  validateHDOutput,
  inputToTrezor,
  outputToTrezor,
  getReferencedTransactions,
  transformReferencedTransactions
} from 'utils/tx';
import * as helper from 'utils/helpers/signtx';
import { getSegwitNetwork, getBech32Network } from 'utils/data/CoinInfo';
import BigNumber from 'bignumber.js';
import type {
  MessageResponse,
  DefaultMessageResponse
} from './helpers/MessageResponse';

import type {
  HDNodeResponse
} from 'utils/types/trezor';

import {
  isMultisigPath,
  isSegwitPath,
  isBech32Path,
  getSerializedPath,
  getScriptType
} from 'utils/pathUtils';
import { toDecimalAmount } from 'utils/formatUtils';
import type { CoinInfo } from 'flowtype';
import type { SignedTx } from 'utils/types/trezor';
import type { Deferred } from 'utils/types';
import type { TransactionOutput } from 'utils/types/trezor';

import type {
  BuildTxOutputRequest,
  BuildTxResult
} from 'hd-wallet';
import { validateCoinPath } from './helpers/paramsValidator';
import {
  validatePath,
} from 'utils/pathUtils';
type Params = {
  outputs: Array<BuildTxOutputRequest>,
  coinInfo: CoinInfo,
  push: boolean,
  path: ?Array<number>,
  fee: number,
  session: TrezorSession,
};

export type ComposeTransactionOptions = {
  outputs: Array<TransactionOutput>,
  coin: string,
  push?: boolean,
  path?: string,
  fee: string,
  crossChain?: boolean,
  session: TrezorSession,
};

export default class ComposeTransaction {
  params: Params;

  backend: BlockBook;

  discovery: ?Discovery;

  composer: TransactionComposer;

  // _getHDNode: (path: Array<number>,
  //   coinInfo: ?CoinInfo) => Promise<trezor.HDNodeResponse>;
  //
  // _typedCall: (type: string,
  //   resType: string, msg: Object) => Promise<DefaultMessageResponse>;

  constructor(options: ComposeTransactionOptions) {
    // validate incoming parameters
    validateParams(options, [
      { name: 'outputs', type: 'array', obligatory: true },
      { name: 'coin', type: 'string', obligatory: true },
      { name: 'push', type: 'boolean' }
    ]);

    let coinInfo: ?CoinInfo = getBitcoinNetwork(options.coin);
    if (!coinInfo) {
      throw NO_COIN_INFO;
    }

    let path: Array<number>;
    if (options.path) {
      path = validatePath(options.path, 3, true);
      if (!coinInfo) {
        coinInfo = getBitcoinNetwork(path);
      } else if (!options.crossChain) {
        validateCoinPath(coinInfo, path);
      }
    }

    // validate each output and transform into hd-wallet format
    const outputs: Array<BuildTxOutputRequest> = [];
    let total: number = 0;
    options.outputs.forEach(out => {
      const output = validateHDOutput(out.valueOf(), coinInfo);
      if (typeof output.amount === 'number') {
        total += output.amount;
      }
      outputs.push(output);
    });

    // TODO: 处理 sendMax
    const sendMax: boolean = outputs.find(o => o.type === 'send-max') !== undefined;

    // there should be only one output when using send-max option
    if (sendMax && outputs.length > 1) {
      throw new Error('Only one output allowed when using "send-max" option.');
    }

    // if outputs contains regular items
    // check if total amount is not lower than dust limit
    if (outputs.find(o => o.type === 'complete') !== undefined && total <= coinInfo.dustLimit) {
      throw new Error('Total amount is too low.');
    }
    let push: boolean;
    if (options.push) {
      push = options.push;
    } else {
      push = false;
    }

    this.params = {
      outputs,
      coinInfo,
      push,
      fee: parseInt(options.fee),
      path: path,
      session: options.session,
    };
    this._getHDNode = this._getHDNode.bind(this);
    this._typedCall = this._typedCall.bind(this);
  }

  async run(): Promise<SignedTx> {
    this.backend = await createBackend(this.params.coinInfo);

    let account;
    if (this.params.path) {
      account = await this._getAccountFromPath(this.params.path);
    } else {
      account = await this._getAccount();
    }
    if (account instanceof Account) {
      return this._composeAndsend(account, this.params.fee);
    } else {
      throw new Error(account.error);
    }
  }

  async getBitcoinHDNode(
    path: Array<number>,
    coinInfo?: ?CoinInfo
  ): Promise<trezor.HDNodeResponse> {
    const suffix: number = 0;
    const childPath: Array<number> = path.concat([suffix]);


    const resKey: trezor.PublicKey =
      await this.getPublicKey(path, 'Bitcoin');
    const childKey: trezor.PublicKey =
      await this.getPublicKey(childPath, 'Bitcoin');
    const publicKey: trezor.PublicKey =
      hdnodeUtils.xpubDerive(resKey, childKey, suffix);

    const response: trezor.HDNodeResponse = {
      path,
      serializedPath: getSerializedPath(path),
      childNum: publicKey.node.child_num,
      xpub: coinInfo ? hdnodeUtils.convertBitcoinXpub(publicKey.xpub, coinInfo.network) : publicKey.xpub,
      chainCode: publicKey.node.chain_code,
      publicKey: publicKey.node.public_key,
      fingerprint: publicKey.node.fingerprint,
      depth: publicKey.node.depth
    };

    // if requested path is a segwit
    // convert xpub to new format
    if (coinInfo) {
      const segwitNetwork = getSegwitNetwork(coinInfo);
      if (segwitNetwork && isSegwitPath(path)) {
        response.xpubSegwit = hdnodeUtils.convertBitcoinXpub(publicKey.xpub, segwitNetwork);
      }
    }
    return response;
  }

  async getPublicKey(
    address_n: Array<number>,
    coin_name: string,
    script_type?: ?string
  ): Promise<trezor.PublicKey> {
    const response: MessageResponse<trezor.PublicKey> =
      await this.params.session.typedCall('GetPublicKey', 'PublicKey', {
        address_n,
        coin_name,
        script_type
      });
    return response.message;
  }

  async _getHDNode(path: Array<number>,
                   coinInfo: ?CoinInfo): Promise<trezor.HDNodeResponse> {
    // return this._getBitcoinHDNode(path, coinInfo);
    // if (!this.device.atLeast(['1.7.2', '2.0.10']))
    const isOld = true;
    if (isOld) {
      return await this.getBitcoinHDNode(path, coinInfo);
    }
    if (!coinInfo) {
      return await this.getBitcoinHDNode(path);
    }

    const suffix: number = 0;
    const childPath: Array<number> = path.concat([suffix]);
    let network: ?bitcoin.Network;
    if (isMultisigPath(path)) {
      network = coinInfo.network;
    } else if (isSegwitPath(path)) {
      network = getSegwitNetwork(coinInfo);
    } else if (isBech32Path(path)) {
      network = getBech32Network(coinInfo);
    }

    let scriptType: ?string = getScriptType(path);
    if (!network) {
      network = coinInfo.network;
      if (scriptType !== 'SPENDADDRESS') {
        scriptType = undefined;
      }
    }

    const resKey: trezor.PublicKey =
      await this.getPublicKey(path, coinInfo.name, scriptType);
    const childKey: trezor.PublicKey =
      await this.getPublicKey(childPath, coinInfo.name, scriptType);
    const publicKey: trezor.PublicKey =
      hdnodeUtils.xpubDerive(resKey, childKey, suffix, network, coinInfo.network);

    const response: trezor.HDNodeResponse = {
      path,
      serializedPath: getSerializedPath(path),
      childNum: publicKey.node.child_num,
      // xpub: coinInfo ? hdnodeUtils.convertBitcoinXpub(publicKey.xpub, coinInfo.network) : publicKey.xpub,
      xpub: publicKey.xpub,
      chainCode: publicKey.node.chain_code,
      publicKey: publicKey.node.public_key,
      fingerprint: publicKey.node.fingerprint,
      depth: publicKey.node.depth
    };

    // if requested path is a segwit
    // convert xpub to new format
    // if (coinInfo) {
    //   const segwitNetwork = getSegwitNetwork(coinInfo);
    //   if (segwitNetwork && isSegwitPath(path)) {
    //     response.xpubSegwit = hdnodeUtils.convertBitcoinXpub(publicKey.xpub, segwitNetwork);
    //   }
    // }

    if (network !== coinInfo.network) {
      response.xpubSegwit = response.xpub;
      response.xpub = hdnodeUtils.convertXpub(publicKey.xpub, network, coinInfo.network);
    }
    return response;
  }

  async _getAccount(): Promise<Account | { error: string }> {
    // 替换自己的实现
    const discovery: Discovery = this.discovery || new Discovery({
      getHDNode: this._getHDNode,
      coinInfo: this.params.coinInfo,
      backend: this.backend
    });

    const discoveryPromise: Deferred<void> = createDeferred();

    discovery.on('update', (accounts: Array<Account>) => {
      console.log('discovery.on update');
    });

    discovery.on('complete', (accounts: Array<Account>) => {
      console.log('discovery.on complete');
      discoveryPromise.resolve();
    });

    if (!this.discovery) {
      this.discovery = discovery;
    }
    discovery.start();

    await discoveryPromise.promise;
    // discovery.removeAllListeners();
    discovery.stop();

    if (discovery.accounts.length === 0) {
      throw new Error('not found account');
    }

    return discovery.accounts[0];
  }

  async _getAccountFromPath(path: Array<number>): Promise<Response> {
    const coinInfo: CoinInfo = fixCoinInfoNetwork(this.params.coinInfo, path);
    const node: HDNodeResponse = await this._getHDNode(path, coinInfo);
    const account = createAccount(path, node.xpub, coinInfo);

    const discovery: Discovery = this.discovery = new Discovery({
      // getHDNode: this.device.getCommands().getHDNode.bind(this.device.getCommands()),
      getHDNode: this._getHDNode,
      coinInfo: this.params.coinInfo,
      backend: this.backend,
      loadInfo: false
    });

    await discovery.getAccountInfo(account);
    return account;
  }

  async _getFee(account: Account): Promise<string | SignedTx> {
    if (this.composer) {
      this.composer.dispose();
    }

    const composer: TransactionComposer = new TransactionComposer(account, this.params.outputs);
    await composer.init(this.backend);
    this.composer = composer;

    // const hasFunds: boolean = await composer.composeAllFeeLevels();
    // if (!hasFunds) {
    //   return 'Not has Funds';
    // }
    //
    // // 外部传入
    // const feeLevel = this.composer.feeLevels[0];
    // const feeLevels = this.composer.getFeeLevelList();
    // console.log(feeLevels);
    // const levels = feeLevels.map(level => ({
    //   value: level.name,
    //   fee: level.value,
    //   label: `${toDecimalAmount(level.value, network.decimals)} BTC`,
    // }));
    return await this._send(feeLevel.name);
  }

  async _typedCall(type: string,
                   resType: string, msg: Object): Promise<DefaultMessageResponse> {
    return this.params.session.typedCall(type, resType, msg);
  }

  async _send(feeLevel: string): Promise<SignedTx> {
    const tx: BuildTxResult = this.composer.composed[feeLevel];

    if (tx.type !== 'final') throw new Error('Trying to sign unfinished tx');

    const bjsRefTxs = await this.backend.loadTransactions(getReferencedTransactions(tx.transaction.inputs));
    const refTxs = transformReferencedTransactions(bjsRefTxs);

    const coinInfo: CoinInfo = this.composer.account.coinInfo;

    const response = await helper.signTx(
      this._typedCall,
      tx.transaction.inputs.map(inp => inputToTrezor(inp, 0)),
      tx.transaction.outputs.sorted.map(out => outputToTrezor(out, coinInfo)),
      refTxs,
      coinInfo
    );

    if (this.params.push) {
      const txid: string = await this.backend.sendTransactionHex(response.serializedTx);
      return {
        ...response,
        txid
      };
    }

    return response;
  }

  async _composeAndsend(account: Account, fee: number): Promise<SignedTx> {
    if (this.composer) {
      this.composer.dispose();
    }

    const composer: TransactionComposer = new TransactionComposer(account, this.params.outputs);
    await composer.init(this.backend);
    this.composer = composer;

    const tx: BuildTxResult = this.composer.compose(fee);

    if (tx.type !== 'final') throw new Error('Trying to sign unfinished tx');

    const bjsRefTxs = await this.backend.loadTransactions(getReferencedTransactions(tx.transaction.inputs));
    const refTxs = transformReferencedTransactions(bjsRefTxs);

    const coinInfo: CoinInfo = this.composer.account.coinInfo;

    const response = await helper.signTx(
      this._typedCall,
      tx.transaction.inputs.map(inp => inputToTrezor(inp, 0)),
      tx.transaction.outputs.sorted.map(out => outputToTrezor(out, coinInfo)),
      refTxs,
      coinInfo
    );

    if (this.params.push) {
      const txid: string = await this.backend.sendTransactionHex(response.serializedTx);
      return {
        ...response,
        txid
      };
    }

    return response;
  }

  dispose() {
    if (this.discovery) {
      const d = this.discovery;
      d.stop();
      d.removeAllListeners();
    }

    if (this.composer) {
      this.composer.dispose();
    }
  }
}
