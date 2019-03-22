/* @flow */
import React from 'react';
import PropTypes from 'prop-types'
// import EthereumTypeSendForm from './ethereum';
import BitcoinTypeSendForm from './bitcoin';

import {
  inject,
  observer,
} from 'mobx-react';
import { matchPath } from "react-router";

type Props = {
};

class AccountSend extends React.Component<Props> {
  render() {
    const match = matchPath(this.props.location.pathname, {
      path: '/device/:device/network/:network',
      exact: false,
      strict: false
    });

    let network;
    if ( match && match.params.network) {
      network = match.params.network.toLowerCase();
    } else {
      return null;
    }

    switch (network) {
      // case 'ethereum':
      //   return <EthereumTypeSendForm/>;
      case 'btc':
        return <BitcoinTypeSendForm/>;
      default:
        return null;
    }
  }
}

AccountSend.propTypes = {
  appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(AccountSend));
