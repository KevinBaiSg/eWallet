/* @flow */
import React from 'react';
import PropTypes from 'prop-types'
import EthereumTypeSummary from './ethereum';
import BitcoinTypeSummary from './bitcoin';

import {
  inject,
  observer
} from 'mobx-react';
import { matchPath } from "react-router";

type Props = {};

class WrapperProps extends React.Component<Props> {
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
      case 'eth':
        return <EthereumTypeSummary/>;
      case 'btc':
        return <BitcoinTypeSummary/>;
      default:
        return null;
    }
  }
}

WrapperProps.propTypes = {
  appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(WrapperProps));
