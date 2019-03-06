/* @flow */

import styled from 'styled-components';
import coins from 'constants/coins';
import colors from 'config/colors';
import ICONS from 'config/icons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
// import Link from 'components/Link';
import RowCoin from '../RowCoin';

import type { Props } from '../common';
import { inject, observer } from 'mobx-react';

const Wrapper = styled.div``;

class CoinMenu extends Component<Props> {
  // getBaseUrl() {
  //   const { selectedDevice } = this.props.wallet;
  //   let baseUrl = '';
  //   if (selectedDevice && selectedDevice.features) {
  //     baseUrl = `/device/${selectedDevice.features.device_id}`;
  //     if (selectedDevice.instance) {
  //       baseUrl += `:${selectedDevice.instance}`;
  //     }
  //   }
  //
  //   return baseUrl;
  // }

  render() {
    const { appState } = this.props;
    const { localStorage } = appState;
    return (
      <Wrapper>
        {localStorage.networks.map(item => (
          <NavLink
            key={item.shortcut}
            to='www.baidu.com'
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
