/* @flow */
'use strict';

// import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath } from './helpers/paramsValidator';
import Discovery from 'utils/helpers/Discovery';
// import * as UI from '../../constants/ui';
import { NO_COIN_INFO } from 'constants/errors';
import * as hdnodeUtils from 'utils/hdnode';
import {
    isMultisigPath,
    isSegwitPath,
    isBech32Path,
    validatePath,
    getAccountLabel,
    getSerializedPath,
    getScriptType,
} from 'utils/pathUtils';
import { create as createDeferred } from 'utils/deferred';

import Account, { create as createAccount } from 'utils/account';
import BlockBook, { create as createBackend } from 'utils/backend';
import { getCoinInfoByCurrency, fixCoinInfoNetwork, getCoinInfoFromPath } from 'utils/data/CoinInfo';
// import { UiMessage } from '../../message/builder';
import type {
  CoinInfo,
  // UiPromiseResponse,
} from 'flowtype';
import type { AccountInfo, HDNodeResponse } from 'utils/types/trezor';
import type { Deferred, CoreMessage } from 'utils/types';
import type { Options } from './backend/BlockBook';

import { getSegwitNetwork, getBech32Network } from 'utils/data/CoinInfo';

type Params = {
    path: ?Array<number>,
    xpub: ?string,
    coinInfo: CoinInfo,
}

type Response = AccountInfo | {
    error: string,
}

export default class GetAccountInfo {
    params: Params;
    confirmed: boolean = false;
    backend: BlockBook;
    discovery: ?Discovery;

    constructor(options: Options) {

        this.session = options.session;

        // super(message);
        this.requiredPermissions = ['read'];
        this.info = 'Export account info';

        // const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(options, [
            { name: 'coin', type: 'string' },
            { name: 'xpub', type: 'string' },
            { name: 'crossChain', type: 'boolean' },
        ]);

        let path: Array<number>;
        let coinInfo: ?CoinInfo;
        if (options.coin) {
            coinInfo = getCoinInfoByCurrency(options.coin);
        }

        if (options.path) {
            path = validatePath(options.path, 3, true);
            if (!coinInfo) {
                coinInfo = getCoinInfoFromPath(path);
            } else if (!options.crossChain) {
                validateCoinPath(coinInfo, path);
            }
        }

        // if there is no coinInfo at this point return error
        if (!coinInfo) {
            throw NO_COIN_INFO;
        } else {
            // check required firmware with coinInfo support
            this.requiredFirmware = [ coinInfo.support.trezor1, coinInfo.support.trezor2 ];
        }

        // delete payload.path;
        // payload.xpub = 'ypub6XKbB5DSkq8Royg8isNtGktj6bmEfGJXDs83Ad5CZ5tpDV8QofwSWQFTWP2Pv24vNdrPhquehL7vRMvSTj2GpKv6UaTQCBKZALm6RJAmxG6'
        // payload.xpub = 'xpub6BiVtCpG9fQQNBuKZoKzhzmENDKdCeXQsNVPF2Ynt8rhyYznmPURQNDmnNnX9SYahZ1DVTaNtsh3pJ4b2jKvsZhpv2oVj76YETCGztKJ3LM'

        this.params = {
            path: path,
            xpub: options.xpub,
            coinInfo,
        };

        this._getHDNode = this._getHDNode.bind(this);
        this.getBitcoinHDNode = this.getBitcoinHDNode.bind(this);
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        // await this.getPopupPromise().promise;
        // initialize user response promise
        // const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        let label: string;
        if (this.params.path) {
            label = getAccountLabel(this.params.path, this.params.coinInfo);
        } else if (this.params.xpub) {
            label = `Export ${ this.params.coinInfo.label } account for public key <span>${ this.params.xpub }</span>`;
        } else {
            return true;
        }

        // request confirmation view
        // this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
        //     view: 'export-account-info',
        //     label,
        // }));

        // wait for user action
        // const uiResp: UiPromiseResponse = await uiPromise.promise;
        // const resp: string = uiResp.payload;

        // this.confirmed = (resp === 'true');
        this.confirmed = true;
        return this.confirmed;
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
            loadInfo: false,
        });

        await discovery.getAccountInfo(account);
        return this._response(account);
    }

    async _getAccountFromPublicKey(): Promise<Response> {
        // const discovery: Discovery = this.discovery = new Discovery({
        //     getHDNode: this.device.getCommands().getHDNode.bind(this.device.getCommands()),
        //     coinInfo: this.params.coinInfo,
        //     backend: this.backend,
        //     loadInfo: false,
        // });
        //
        // const deferred: Deferred<Response> = createDeferred('account_discovery');
        // discovery.on('update', async (accounts: Array<Account>) => {
        //     const account = accounts.find(a => a.xpub === this.params.xpub);
        //     if (account) {
        //         discovery.removeAllListeners();
        //         discovery.completed = true;
        //
        //         await discovery.getAccountInfo(account);
        //         discovery.stop();
        //         deferred.resolve(this._response(account));
        //     }
        // });
        // discovery.on('complete', () => {
        //     deferred.resolve(this._response(null));
        // });
        //
        // discovery.start();
        //
        // return await deferred.promise;
    }

    async getBitcoinHDNode(
      path: Array<number>,
      coinInfo?: ?CoinInfo
    ): Promise<trezor.HDNodeResponse> {
      const suffix: number = 0;
      const childPath: Array<number> = path.concat([suffix]);


      const resKey: MessageResponse<trezor.PublicKey> =
        await this.getPublicKey(path, 'Bitcoin');
      const childKey: MessageResponse<trezor.PublicKey>=
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
        depth: publicKey.node.depth,
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
    script_type?: ?string,
  ): Promise<trezor.PublicKey> {
    const response: MessageResponse<trezor.PublicKey> =
      await this.session.typedCall('GetPublicKey', 'PublicKey', {
      address_n,
      coin_name,
      script_type,
    });
    return response.message;
  }

    async _getHDNode(path: Array<number>, coinInfo: ?CoinInfo): Promise<trezor.HDNodeResponse> {
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

      // const resKeyMessage: MessageResponse<trezor.PublicKey> =
      //   await this.getPublicKey(path, coinInfo.name, scriptType);
      // const resKey: trezor.PublicKey = resKeyMessage.message;
      //
      // const childKeyMessage: MessageResponse<trezor.PublicKey>=
      //   await this.getPublicKey(childPath, coinInfo.name, scriptType);
      // const childKey: trezor.PublicKey = childKeyMessage.message;
      //
      // const publicKey: trezor.PublicKey =
      //   hdnodeUtils.xpubDerive(resKey, childKey, suffix, network, coinInfo.network);

      const resKey: MessageResponse<trezor.PublicKey> =
        await this.getPublicKey(path, coinInfo.name, scriptType);
      const childKey: MessageResponse<trezor.PublicKey>=
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
        depth: publicKey.node.depth,
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
            // 替换
            // getHDNode: this.device.getCommands().getHDNode.bind(this.device.getCommands()),
            getHDNode: this._getHDNode,
            coinInfo: this.params.coinInfo,
            backend: this.backend,
        });

        const discoveryPromise: Deferred<void> = createDeferred();

        discovery.on('update', (accounts: Array<Account>) => {
            // this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
            //     coinInfo: this.params.coinInfo,
            //     accounts: accounts.map(a => a.toMessage()),
            // }));
          // console.log('discovery.on update')
        });

        discovery.on('complete', (accounts: Array<Account>) => {
            // this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
            //     coinInfo: this.params.coinInfo,
            //     accounts: accounts.map(a => a.toMessage()),
            //     complete: true,
            // }));
          // console.log('discovery.on complete');
          discoveryPromise.resolve();
        });

        try {
            discovery.start();
        } catch (error) {
            return {
                error,
            };
        }

        // set select account view
        // this view will be updated from discovery events
        // this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
        //     coinInfo: this.params.coinInfo,
        //     accounts: [],
        //     start: true,
        // }));

        // wait for user action
        // const uiResp: UiPromiseResponse = await this.createUiPromise(UI.RECEIVE_ACCOUNT, this.device).promise;

        await discoveryPromise.promise;
        discovery.stop();

        // const resp: number = parseInt(uiResp.payload);
        console.log(`discovery accounts count: ${discovery.accounts.length}`)
        const account = discovery.accounts[0];

        return this._response(account);
    }

    _response(account: ?Account): Response {
        if (!account) {
            return {
                error: 'No account found',
            };
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
