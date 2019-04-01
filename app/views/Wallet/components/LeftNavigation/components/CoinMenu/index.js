/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  inject,
  observer
} from 'mobx-react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import RowCoin from '../RowCoin';

const Wrapper = styled.div``;

class CoinMenu extends Component<Props> {
  constructor(props) {
    super(props);
    this.getBaseUrl = this.getBaseUrl.bind(this);
  }

  getBaseUrl() {
    const { eWalletDevice } = this.props.appState;
    let baseUrl = '';
    if (eWalletDevice && eWalletDevice.device) {
      baseUrl = `/device/${eWalletDevice.device.features.device_id}`;
    }

    return baseUrl;
  }

  render() {
    const { appState } = this.props;
    const { localStorage } = appState;
    return (
      <Wrapper>
        {localStorage.networks.map(item => (
          <NavLink
            key={item.shortcut}
            to={`${this.getBaseUrl()}/network/${item.shortcut}/account/0`}
          >
            <RowCoin
              network={{
                name: item.name,
                shortcut: item.shortcut
              }}
            />
          </NavLink>
        ))}
      </Wrapper>
    );
  }
}

CoinMenu.propTypes = {
  appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(CoinMenu));
