/* @flow */

import * as React from 'react';
import {
  inject,
  observer
} from 'mobx-react';
import { matchPath } from 'react-router'
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import colors from 'config/colors';
import { FONT_SIZE } from 'config/variables';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import DeviceHeader from 'components/DeviceHeader';

import AccountMenu from './components/AccountMenu';
import CoinMenu from './components/CoinMenu';
import Sidebar from './components/Sidebar';

const Header = styled(DeviceHeader)`
    border-right: 1px solid ${colors.BACKGROUND};
    flex: 0 0 auto;
`;

const Counter = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid ${colors.DIVIDER};
    border-radius: 50%;
    color: ${colors.TEXT_SECONDARY};
    width: 24px;
    height: 24px;
    font-size: ${FONT_SIZE.COUNTER};
    margin-right: 8px;
`;

const TransitionGroupWrapper = styled(TransitionGroup)`
    width: 640px;
`;

const TransitionContentWrapper = styled.div`
    width: 320px;
    display: inline-block;
    vertical-align: top;
`;

const Footer = styled.div.attrs(props => ({
  style: { position: props.position }
}))`
    width: 320px;
    bottom: 0;
    background: ${colors.MAIN};
    border-right: 1px solid ${colors.BACKGROUND};
`;

const Body = styled.div`
    flex: 1 0 auto;
    width: 320px;
    min-height: ${props => (props.minHeight ? `${props.minHeight}px` : '0px')};
`;

const Help = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 319px;
    padding: 8px 0px;
    border-top: 1px solid ${colors.BACKGROUND};
`;

const A = styled.a`
    color: ${colors.TEXT_SECONDARY};
    font-size: ${FONT_SIZE.SMALL};
    display: inline-block;
    padding: 8px;
    height: auto;

    &:hover {
        background: transparent;
        color: ${colors.TEXT_PRIMARY};
    }
`;

type TransitionMenuProps = {
  animationType: ?string;
  children?: React.Node;
}

const TransitionMenu = (props: TransitionMenuProps): React$Element<TransitionGroup> => (
  <TransitionGroupWrapper component="div" className="transition-container">
    <CSSTransition
      key={props.animationType}
      in
      out
      classNames={props.animationType}
      appear={false}
      timeout={300}
    >
      <TransitionContentWrapper>
        {props.children}
      </TransitionContentWrapper>
    </CSSTransition>
  </TransitionGroupWrapper>
);

type State = {
  animationType: ?string;
  clicked: boolean;
  bodyMinHeight: number;
}

type Props = {};

class LeftNavigation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.deviceMenuRef = React.createRef();
    // const { location } = this.props.router;
    // const hasNetwork = location && location.state && location.state.network;
    this.state = {
      // animationType: hasNetwork ? 'slide-left' : null,
      animationType: 'slide-right',
      clicked: false,
      bodyMinHeight: 0
    };
  }

  componentDidMount() {
    this.recalculateBodyMinHeight();
  }

  componentWillReceiveProps(nextProps: Props) {
    const { eWalletDevice } = nextProps.appState;
    const deviceReady = eWalletDevice && eWalletDevice.device && eWalletDevice.connected === true;

    const match = matchPath(nextProps.location.pathname, {
      path: '/device/:device/network/:network',
      exact: false,
      strict: false
    });

    const hasNetwork = match && match.params.network;
    if (hasNetwork) {
      this.setState({
        animationType: 'slide-left'
      });
    } else {
      this.setState({
        animationType: deviceReady ? 'slide-right' : null
      });
    }
  }

  componentDidUpdate() {
    this.recalculateBodyMinHeight();
  }

  shouldRenderAccounts() {
    // const { selectedDevice } = this.props.wallet;
    // const { location } = this.props.router;
    // return selectedDevice
    //     && location
    //     && location.state
    //     && location.state.network
    //     && this.state.animationType === 'slide-left';
    return this.state.animationType === 'slide-left';
  }

  handleOpen() {
    this.setState({ clicked: true });
    this.props.toggleDeviceDropdown(!this.props.wallet.dropdownOpened);
  }

  shouldRenderCoins() {
    return this.state.animationType !== 'slide-left';
  }

  recalculateBodyMinHeight() {
    if (this.deviceMenuRef.current) {
      this.setState({
        bodyMinHeight: this.deviceMenuRef.current.getMenuHeight()
      });
    }
  }

  deviceMenuRef: { current: any };

  render() {
    const { props } = this;
    const { appState } = props;
    const { eWalletDevice } = appState;

    let menu;
    if (this.shouldRenderAccounts()) {
      menu = (
        <TransitionMenu animationType="slide-left">
          <AccountMenu {...props} />
        </TransitionMenu>
      );
    } else if (this.shouldRenderCoins()) {
      menu = (
        <TransitionMenu animationType="slide-right">
          <CoinMenu {...props} />
        </TransitionMenu>
      );
    }

    return (
      <Sidebar isOpen>
        <Header
          isSelected
          isHoverable={false}
          onClickWrapper={() => {
            if (!eWalletDevice.connected || !eWalletDevice.device ||
              !eWalletDevice.features.device_id) {
              return ;
            }

            if (!!eWalletDevice.device.isInitialized()) {
              const id = appState.eWalletDevice.features.device_id;
              this.props.history.replace(`/device/${id}/settings`);
            }
          }}
          device={eWalletDevice}
          disabled={false}
          isOpen
          // icon={(
          //   <React.Fragment>
          //     <WalletTypeIcon type={'standard'}
          //                     size={25} color={colors.TEXT_SECONDARY}/>
          //     <Icon
          //       canAnimate={this.state.clicked === true}
          //       isActive={wallet.dropdownOpened}
          //       size={25}
          //       color={colors.TEXT_SECONDARY}
          //       icon={icons.ARROW_DOWN}
          //     />
          //   </React.Fragment>
          // )}
          {...this.props}
        />
        <Body minHeight={this.state.bodyMinHeight}>
        {eWalletDevice.isInitialized && menu}
        </Body>
      </Sidebar>
    );
  }
}

LeftNavigation.propTypes = {
  // appState: PropTypes.object.isRequired
};

export default withRouter(inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(LeftNavigation)));
