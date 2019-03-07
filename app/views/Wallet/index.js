/* @flow */

import * as React from 'react';
import {
  inject,
  observer
} from 'mobx-react';

import PropTypes from 'prop-types';

import colors from 'config/colors';
import styled, { css } from 'styled-components';
import { Route, withRouter } from 'react-router-dom';
import type { State } from 'flowtype';

import Header from 'components/Header';
import Footer from 'components/Footer';

import { SCREEN_SIZE } from 'config/variables';
import Backdrop from 'components/Backdrop';
import LeftNavigation from './components/LeftNavigation';
import AppState from 'store/app-state';
import { getPattern } from '../../support/routes';

// import TopNavigationAccount from './components/TopNavigationAccount';
// import TopNavigationDeviceSettings from './components/TopNavigationDeviceSettings';

type Props = {
  appState: AppState,
};

const AppWrapper = styled.div`
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: ${colors.BACKGROUND};

    &.resized {
        min-height: 680px;
    }
`;

const WalletWrapper = styled.div`
    width: 100%;
    max-width: 1170px;
    margin: 0 auto;
    flex: 1;
    background: ${colors.WHITE};
    display: flex;
    flex-direction: row;
    border-radius: 4px 4px 0px 0px;
    margin-top: 32px;

    @media screen and (max-width: 1170px) {
        border-radius: 0px;
        margin-top: 0px;
    }
`;

const MainContent = styled.article`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    border-top-right-radius: 4px;

    @media screen and (max-width: ${SCREEN_SIZE.SM}){
        ${props => props.preventBgScroll && css`
            position: fixed;
            width: 100%;
            min-height: calc(100vh - 52px);
        `}
    }

    @media screen and (max-width: 1170px) {
        border-top-right-radius: 0px;
    }
`;

const Navigation = styled.nav`
    height: 70px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    background: ${colors.WHITE};
    position: relative;
`;

const Body = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
`;

const StyledBackdrop = styled(Backdrop)`
    display: none;

    @media screen and (max-width: ${SCREEN_SIZE.SM}) {
        display: initial;
    }
`;

class Wallet extends React.Component<Props, State> {
  render() {
    const { props } = this;
    const { eWalletDevice, wallet } = props.appState;

    if (!eWalletDevice.connected) {
      this.props.history.replace(getPattern('landing-home'));
      return null
    }

    return (
      <AppWrapper>
        <Header sidebarEnabled={!!eWalletDevice.device}
                sidebarOpened={!!wallet.showSidebar}
          /*toggleSidebar={props.toggleSidebar}*//>
        {/*<AppNotifications />*/}
        <WalletWrapper>
          <StyledBackdrop show onClick={props.toggleSidebar} animated/>
          {eWalletDevice.device && <LeftNavigation/>}
          <MainContent preventBgScroll={false}>
            <Navigation>
              {/*<Route path="/device/:device/network/:network/account/:account" component={TopNavigationAccount}/>*/}
              {/*<Routeret path="/device/:device/device-settings" component={TopNavigationDeviceSettings}/>*/}
            </Navigation>
            {/*<ContextNotifications />*/}
            {/*<Log />*/}
            <Body>
            {props.children}
            </Body>
            {/*<Footer opened/>*/}
          </MainContent>
        </WalletWrapper>
        {/*<ModalContainer />*/}
      </AppWrapper>)
  }
}

Wallet.propTypes = {
  appState: PropTypes.object.isRequired
};

export default withRouter(inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(Wallet)));
