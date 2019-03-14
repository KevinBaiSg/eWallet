/* @flow */
'use strict';

import * as bitcoin from 'bitcoinjs-lib-zcash';

import * as hdnodeUtils from 'utils/hdnode';
import Account, { create as createAccount } from 'utils/account';
import BlockBook, { create as createBackend } from 'utils/backend';
import Discovery from 'utils/helpers/Discovery';
import { create as createDeferred } from 'utils/deferred';
import {
  isMultisigPath,
  isSegwitPath,
  isBech32Path,
  validatePath,
  getAccountLabel,
  getSerializedPath,
  getScriptType
} from 'utils/pathUtils';

import {
  validateParams,
  validateCoinPath
} from './helpers/paramsValidator';

import { NO_COIN_INFO } from 'constants/errors';

import {
  getBitcoinNetwork,
  fixCoinInfoNetwork,
  getSegwitNetwork,
  getBech32Network
} from 'utils/data/CoinInfo';

import * as trezor from 'utils/types/trezor';
import type {
  Deferred
} from 'utils/types';
import type {
  HDNodeResponse
} from 'utils/types/trezor';
import type { CoinInfo } from 'flowtype';
import type { MessageResponse } from './helpers/MessageResponse';
import type { AccountInfoPayload } from 'utils/types/response';
import type { Session as TrezorSession } from 'trezor.js';

type Params = {
  path: ?Array<number>,
  xpub: ?string,
  coinInfo: CoinInfo,
  session: TrezorSession,
}

type Response = AccountInfoPayload;

export type GetAccountInfoOptions = {
  coin?: string,
  xpub?: string,
  path?: string,
  crossChain?: boolean,
  session: TrezorSession,
};

export default class GetAccountInfo {

  params: Params;

  backend: BlockBook;

  discovery: ?Discovery;

  // _getHDNode: (path: Array<number>,
  //   coinInfo: ?CoinInfo) => Promise<trezor.HDNodeResponse>
  //
  // _getBitcoinHDNode: (path: Array<number>,
  //   coinInfo?: ?CoinInfo) => Promise<trezor.HDNodeResponse>;

  constructor(options: GetAccountInfoOptions) {

    // this.session = options.session;

    // validate incoming parameters
    validateParams(options, [
      { name: 'coin', type: 'string' },
      { name: 'xpub', type: 'string' },
      { name: 'crossChain', type: 'boolean' }
    ]);

    let path: Array<number>;
    let coinInfo: ?CoinInfo;
    if (options.coin) {
      coinInfo = getBitcoinNetwork(options.coin);
    }

    if (options.path) {
      path = validatePath(options.path, 3, true);
      if (!coinInfo) {
        coinInfo = getBitcoinNetwork(path);
      } else if (!options.crossChain) {
        validateCoinPath(coinInfo, path);
      }
    }

    // if there is no coinInfo at this point return error
    if (!coinInfo) {
      throw NO_COIN_INFO;
    } else {
      // check required firmware with coinInfo support
      // this.requiredFirmware = [ coinInfo.support.trezor1, coinInfo.support.trezor2 ];
    }

    this.params = {
      path: path,
      xpub: options.xpub,
      coinInfo,
      session: options.session
    };

    this._getHDNode = this._getHDNode.bind(this);
    this._getBitcoinHDNode = this._getBitcoinHDNode.bind(this);
  }

  async run(): Promise<Response> {
    // initialize backend
    this.backend = await createBackend(this.params.coinInfo);

    if (this.params.path) {
      return await this._getAccountFromPath(this.params.path);
    } else if (this.params.xpub) {
      return await this._getAccountFromPublicKey();
    } else {
      return await this._getAccountFromDiscovery();
    }
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
    return this._response(account);
  }

  async _getAccountFromPublicKey(): Promise<Response> {
    const discovery: Discovery = this.discovery = new Discovery({
      getHDNode: this._getHDNode,
      coinInfo: this.params.coinInfo,
      backend: this.backend,
      loadInfo: false
    });

    const deferred: Deferred<Response> = createDeferred('account_discovery');
    discovery.on('update', async (accounts: Array<Account>) => {
      const account = accounts.find(a => a.xpub === this.params.xpub);
      if (account) {
        discovery.removeAllListeners();
        discovery.completed = true;

        await discovery.getAccountInfo(account);
        discovery.stop();
        deferred.resolve(this._response(account));
      }
    });
    discovery.on('complete', () => {
      deferred.resolve(this._response(null));
    });

    discovery.start();

    return await deferred.promise;
  }

  async _getBitcoinHDNode(
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

    // const resKey: trezor.PublicKey = await this.session.getPublicKey(path, 'Bitcoin');
    // const childKey: trezor.PublicKey = await this.session.getPublicKey(childPath, 'Bitcoin');
    // const publicKey: trezor.PublicKey = hdnodeUtils.xpubDerive(resKey, childKey, suffix);

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

  async _getHDNode(path: Array<number>, coinInfo: ?CoinInfo): Promise<trezor.HDNodeResponse> {
    // return this._getBitcoinHDNode(path, coinInfo);
    // if (!this.device.atLeast(['1.7.2', '2.0.10']))
    const isOld = true;
    if (isOld) {
      return await this._getBitcoinHDNode(path, coinInfo);
    }
    if (!coinInfo) {
      return await this._getBitcoinHDNode(path);
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

  async _getAccountFromDiscovery(): Promise<Response> {
    const discovery: Discovery = this.discovery = new Discovery({
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

    try {
      discovery.start();
    } catch (error) {
      throw error;
    }

    await discoveryPromise.promise;
    discovery.stop();
    // TODO: 处理多账户选择
    const account = discovery.accounts[0];
    return this._response(account);
  }

  _response(account: ?Account): Response {
    if (!account) {
      throw new Error('Account not found');
    }

    const nextAddress: string = account.getNextAddress();
    return {
      id: account.id,
      path: account.path,
      serializedPath: getSerializedPath(account.path),
      address: nextAddress,
      addressIndex: account.getNextAddressId(),
      addressPath: account.getAddressPath(nextAddress),
      addressSerializedPath: getSerializedPath(account.getAddressPath(nextAddress)),
      xpub: account.xpub,
      balance: account.getBalance(),
      confirmed: account.getConfirmedBalance(),
      transactions: account.getTransactionsCount(),
      utxo: account.getUtxos(),
      usedAddresses: account.getUsedAddresses(),
      unusedAddresses: account.getUnusedAddresses()
    };
  }

  dispose() {
    if (this.discovery) {
      const d = this.discovery;
      d.stop();
      d.removeAllListeners();
    }
  }
}
