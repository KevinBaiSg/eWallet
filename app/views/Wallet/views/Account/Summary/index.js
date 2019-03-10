/* @flow */
import React from 'react';
// import EthereumTypeSummary from './ethereum';
import BitcoinTypeSummary from './bitcoin';

import {
  inject,
  observer
} from 'mobx-react';

type Props = {};

class WrapperProps extends React.Component<Props> {
  render() {
    const { wallet } = this.props.appState;
    switch (wallet.network.type) {
      // case 'ethereum':
      //   return <EthereumTypeSummary/>;
      case 'bitcoin':
        return <BitcoinTypeSummary/>;
      default:
        return null;
    }
  }
}

WrapperProps.propTypes = {
  // appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(WrapperProps));
