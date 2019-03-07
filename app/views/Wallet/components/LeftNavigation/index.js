/* @flow */

import * as React from 'react';
import {
  inject,
  observer
} from 'mobx-react';

import PropTypes from 'prop-types';

import colors from 'config/colors';
import { FONT_SIZE } from 'config/variables';
import Icon from 'components/Icon';
import WalletTypeIcon from 'components/images/WalletType';
import icons from 'config/icons';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import DeviceHeader from 'components/DeviceHeader';
import * as deviceUtils from 'utils/device';

import AccountMenu from './components/AccountMenu';
import CoinMenu from './components/CoinMenu';
import DeviceMenu from './components/DeviceMenu';
import Sidebar from './components/Sidebar';

// import type { Props } from './components/common';

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

// TransitionMenu needs to dispatch window.resize event
// in order to StickyContainer be recalculated
const TransitionMenu = (props: TransitionMenuProps): React$Element<TransitionGroup> => (
  <TransitionGroupWrapper component="div" className="transition-container">
    <CSSTransition
      key={props.animationType}
      onExit={() => {
        window.dispatchEvent(new Event('resize'));
      }}
      onExited={() => window.dispatchEvent(new Event('resize'))}
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

type Props = {
};

class LeftNavigation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.deviceMenuRef = React.createRef();
    // const { location } = this.props.router;
    // const hasNetwork = location && location.state && location.state.network;
    this.state = {
      // animationType: hasNetwork ? 'slide-left' : null,
      animationType: 'slide-left',
      clicked: false,
      bodyMinHeight: 0
    };
  }

  componentDidMount() {
    this.recalculateBodyMinHeight();
  }

  componentWillReceiveProps(nextProps: Props) {
    // const { selectedDevice } = nextProps.wallet;
    // const { location } = nextProps.router;
    // const hasNetwork = location && location.state.network;
    // const deviceReady = selectedDevice && selectedDevice.features && selectedDevice.mode === 'normal';

    // if (hasNetwork) {
    //     this.setState({
    //         animationType: 'slide-left',
    //     });
    // } else {
    //     this.setState({
    //         animationType: deviceReady ? 'slide-right' : null,
    //     });
    // }

    this.setState({
      animationType: 'slide-left'
    });
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
    return true;
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
    const { eWalletDevice, wallet } = appState;
    let menu;
    // if (this.shouldRenderAccounts()) {
    //   menu = (
    //     <TransitionMenu animationType="slide-left">
    //       <AccountMenu {...props} />
    //     </TransitionMenu>
    //   );
    // } else if (this.shouldRenderCoins()) {
    //   menu = (
    //     <TransitionMenu animationType="slide-right">
    //       <CoinMenu {...props} />
    //     </TransitionMenu>
    //   );
    // }

    menu = (
      <TransitionMenu animationType="slide-right">
        <CoinMenu {...props} />
      </TransitionMenu>
    );


    // const { selectedDevice, dropdownOpened } = props.wallet;
    // const isDeviceAccessible = deviceUtils.isDeviceAccessible(selectedDevice);
    return (
      <Sidebar isOpen>
        <Header
          isSelected
          isHoverable={false}
          onClickWrapper={() => {
            // if (isDeviceAccessible || this.props.devices.length > 1) {
            //   this.handleOpen();
            // }
            console.log('onClickWrapper')
          }}
          device={eWalletDevice}
          disabled={false}
          isOpen
          icon={(
            <React.Fragment>
              <WalletTypeIcon type={'standard'}
                              size={25} color={colors.TEXT_SECONDARY}/>
              <Icon
                canAnimate={this.state.clicked === true}
                isActive={wallet.dropdownOpened}
                size={25}
                color={colors.TEXT_SECONDARY}
                icon={icons.ARROW_DOWN}
              />
            </React.Fragment>
          )}
          {...this.props}
        />
        <Body minHeight={this.state.bodyMinHeight}>
        {wallet.dropdownOpened && <DeviceMenu ref={this.deviceMenuRef} {...this.props} />}
        {/*{isDeviceAccessible && menu}*/}
        {menu}
        </Body>
      </Sidebar>
    );
  }
}

LeftNavigation.propTypes = {
  appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(LeftNavigation));
