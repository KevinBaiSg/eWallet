/* @flow */
import React from 'react';
import { QRCode } from 'react-qr-svg';
import styled from 'styled-components';

import Title from 'views/Wallet/components/Title';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import Input from 'components/inputs/Input';
import DeviceIcon from 'components/images/DeviceIcon';

import ICONS from 'config/icons';
import colors from 'config/colors';

import Content from 'views/Wallet/components/Content';
import VerifyAddressTooltip from '../components/VerifyAddressTooltip';
import PropTypes from "prop-types";
import { inject, observer } from 'mobx-react';
import type { MessageResponse } from 'trezor.js'
import { validatePath } from 'utils/pathUtils';

const Label = styled.div`
    padding-bottom: 10px;
    color: ${colors.TEXT_SECONDARY};
`;

const AddressWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
`;

const StyledQRCode = styled(QRCode)`
    padding: 15px;
    margin-top: 0 25px;
    border: 1px solid ${colors.BODY};
`;

const ShowAddressButton = styled(Button)`
    min-width: 195px;
    padding: 0;
    white-space: nowrap;
    display: flex;
    height: 40px;
    align-items: center;
    align-self: flex-end;
    justify-content: center;

    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    @media screen and (max-width: 795px) {
        margin-top: 10px;
        align-self: auto;
        border-radius: 3px;
    }
`;

const ShowAddressIcon = styled(Icon)`
    margin-right: 7px;
    position: relative;
    top: 2px;
`;

const EyeButton = styled(Button)`
    z-index: 10001;
    padding: 0;
    width: 30px;
    background: transparent;
    top: 5px;
    position: absolute;
    right: 10px;

    &:hover {
        background: transparent;
    }
`;

const Row = styled.div`
    display: flex;
    width: 100%;
    padding-bottom: 28px;

    @media screen and (max-width: 795px) {
        flex-direction: column;
    }
`;

const QrWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

class AccountReceive extends React.Component<Props> {
  state = {
    addressVerified: false,
    isAddressVerifying: false,
    completed: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      addressVerified: false,
      isAddressVerifying: false,
      completed: false,
    };
    this.showAddress = this.showAddress.bind(this);
  }

  showAddress(path: Array<number>, address: string) {
    const { device } = this.props.appState.eWalletDevice;
    this.setState({isAddressVerifying: true});
    if (!!device) {
      device.waitForSessionAndRun(async (session) => {
        try {
          const verified: boolean =
            await session.verifyAddress(path, address, 'bitcoin', true);
          if (verified) {
            this.setState({
              addressVerified: true,
              isAddressVerifying: false,
            })
          } else {
            this.setState({
              addressVerified: false,
              isAddressVerifying: false,
            })
          }
        } catch (e) {
          console.error('Call rejected:', e);
          this.setState({isAddressVerifying: false});
        }
      }).catch(function(error) {
        console.error('Call rejected:', error);
        this.setState({isAddressVerifying: false});
      })
    }


    // const selected = getState().wallet.selectedDevice;
    // const { network } = getState().selectedAccount;
    //
    // if (!selected || !network) return;
    //
    // if (selected && (!selected.connected || !selected.available)) {
    //   dispatch({
    //     type: RECEIVE.REQUEST_UNVERIFIED,
    //     device: selected,
    //   });
    //   return;
    // }
    //
    // const params = {
    //   device: {
    //     path: selected.path,
    //     instance: selected.instance,
    //     state: selected.state,
    //   },
    //   path,
    //   useEmptyPassphrase: selected.useEmptyPassphrase,
    // };
    //
    // let response;
    // switch (network.type) {
    //   case 'ethereum':
    //     response = await TrezorConnect.ethereumGetAddress(params);
    //     break;
    //   case 'ripple':
    //     response = await TrezorConnect.rippleGetAddress(params);
    //     break;
    //   default:
    //     response = { payload: { error: `ReceiveActions.showAddress: Unknown network type: ${network.type}` } };
    //     break;
    // }
    //
    // if (response.success) {
    //   dispatch({
    //     type: RECEIVE.SHOW_ADDRESS,
    //   });
    // } else {
    //   dispatch({
    //     type: RECEIVE.HIDE_ADDRESS,
    //   });
    //
    //   dispatch({
    //     type: NOTIFICATION.ADD,
    //     payload: {
    //       type: 'error',
    //       title: 'Verifying address error',
    //       message: response.payload.error,
    //       cancelable: true,
    //       actions: [
    //         {
    //           label: 'Try again',
    //           callback: () => {
    //             dispatch(showAddress(path));
    //           },
    //         },
    //       ],
    //     },
    //   });
    // }
  };

  render() {
    const { wallet, eWalletDevice } = this.props.appState;

    const {account, rates} = wallet;
    if (!account || !rates) {
      const loader = {
        type: 'progress',
        title: 'Loading account',
      };
      return <Content loader={loader} isLoading />;
    }

    // const isAddressVerifying = props.modal.context === CONTEXT_DEVICE && props.modal.windowType === 'ButtonRequest_Address';
    const isAddressHidden = !this.state.isAddressVerifying && !this.state.addressVerified;
    const { address, addressPath } = account;
    let showAddress = `${address.substring(0, 16)}...`;
    if (this.state.addressVerified || this.state.isAddressVerifying) {
      showAddress = address;
    }

    return (
      <Content>
        <React.Fragment>
          <Title>Receive Bitcoin(BTC)</Title>
          <AddressWrapper isShowingQrCode={this.state.addressVerified}>
            <Row>
              <Input
                type="text"
                readOnly
                autoSelect
                topLabel="Address"
                value={showAddress}
                isPartiallyHidden={isAddressHidden}
                trezorAction={this.state.isAddressVerifying ? (
                  <React.Fragment>
                    <DeviceIcon device={eWalletDevice.device} color={colors.WHITE}/>
                    Check address on your Device
                  </React.Fragment>
                ) : null}
                icon={(this.state.addressVerified && !this.state.isAddressVerifying) && (
                  <Tooltip
                    placement="left"
                    content={(
                      <VerifyAddressTooltip
                        isConnected={eWalletDevice.connected}
                        isAvailable={eWalletDevice.available}
                        addressUnverified={false}
                      />
                    )}
                  >
                    <EyeButton onClick={() => { this.showAddress(addressPath, address) }}>
                      <Icon
                        icon={ICONS.EYE}
                        color={colors.TEXT_PRIMARY}
                      />
                    </EyeButton>
                  </Tooltip>
                )}
              />
              {!this.state.addressVerified && (
                <ShowAddressButton onClick={() => { this.showAddress(addressPath, address) } }
                                   isDisabled={eWalletDevice.connected && this.state.completed}>
                  <ShowAddressIcon icon={ICONS.EYE} color={colors.WHITE}/>Show full address
                </ShowAddressButton>
              )}
            </Row>
            {this.state.addressVerified && !this.state.isAddressVerifying && (
              <QrWrapper>
                <Label>QR code</Label>
                <StyledQRCode
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="Q"
                  style={{ width: 150 }}
                  value={address}
                />
              </QrWrapper>
            )}
          </AddressWrapper>
        </React.Fragment>
      </Content>
    );
  }
}

AccountReceive.propTypes = {
  appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(AccountReceive));
