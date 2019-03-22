/* @flow */
import React from 'react';
import BigNumber from 'bignumber.js';
import Icon from 'components/Icon';
import colors from 'config/colors';
import Loader from 'components/Loader';
import styled, { css } from 'styled-components';
// import * as stateUtils from 'reducers/utils';
import Tooltip from 'components/Tooltip';
import ICONS from 'config/icons';

import { NavLink } from 'react-router-dom';
// import { findDeviceAccounts } from 'reducers/AccountsReducer';
import {
  FONT_SIZE, BORDER_WIDTH, LEFT_NAVIGATION_ROW
} from 'config/variables';

import type { Accounts } from 'flowtype';
import type { Props } from '../common';
import Row from '../Row';
import RowCoin from '../RowCoin';
import PropTypes from "prop-types";
import { inject, observer } from 'mobx-react';

const Wrapper = styled.div``;

const Text = styled.span`
    font-size: ${FONT_SIZE.SMALL};
    color: ${colors.TEXT_SECONDARY};
`;

const RowAccountWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: ${LEFT_NAVIGATION_ROW.PADDING};
    font-size: ${FONT_SIZE.BASE};
    color: ${colors.TEXT_PRIMARY};
    border-left: ${BORDER_WIDTH.SELECTED} solid transparent;
    border-bottom: 1px solid ${colors.DIVIDER};

    &:hover {
        background-color: ${colors.GRAY_LIGHT};
    }

    ${props => props.borderTop && css`
        border-top: 1px solid ${colors.DIVIDER};
    `}

    ${props => props.isSelected && css`
        border-left: ${BORDER_WIDTH.SELECTED} solid ${colors.GREEN_PRIMARY};
        background: ${colors.WHITE};
        &:hover {
            background-color: ${colors.WHITE};
        }
    `}
`;

const RowAddAccountWrapper = styled.div`
    width: 100%;
    padding: ${LEFT_NAVIGATION_ROW.PADDING};
    display: flex;
    align-items: center;
    color: ${colors.TEXT_SECONDARY};
    &:hover {
        cursor: ${props => (props.disabled ? 'default' : 'pointer')};
        color: ${props => (props.disabled ? colors.TEXT_SECONDARY : colors.TEXT_PRIMARY)};
    }
`;

const AddAccountIconWrapper = styled.div`
    margin-right: 12px;
`;

const DiscoveryLoadingWrapper = styled.div`
    display: flex;
    align-items: center;
    padding: ${LEFT_NAVIGATION_ROW.PADDING};
    font-size: ${FONT_SIZE.BASE};
    white-space: nowrap;
    color: ${colors.TEXT_SECONDARY};
`;

const DiscoveryLoadingText = styled.span`
    margin-left: 14px;
`;

class AccountMenu extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.selectedAccounts = this.selectedAccounts.bind(this);
    this.discoveryStatus = this.discoveryStatus.bind(this);
    this.getBaseUrl = this.getBaseUrl.bind(this);
  }

  // TODO: 完成该组件
  selectedAccounts() {
    return null;
  };

  // TODO: 完成该组件
  discoveryStatus() {
    return null;
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
    const { wallet } = this.props.appState;

    return (
      <Wrapper>
        <NavLink to={this.getBaseUrl()}>
          <RowCoin
            network={{
              name: wallet.network.name,
              shortcut: wallet.network.shortcut,
            }}
            iconLeft={{
              type: ICONS.ARROW_LEFT,
              color: colors.TEXT_PRIMARY,
              size: 20
            }}
          />
        </NavLink>
        <Wrapper>
          {this.selectedAccounts()}
        </Wrapper>
        {this.discoveryStatus()}
      </Wrapper>
    )
  };
};

AccountMenu.propTypes = {
  appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(AccountMenu));
