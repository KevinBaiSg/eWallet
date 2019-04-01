/* @flow */

import React from 'react';
// import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { Select } from 'components/Select';
import Button from 'components/Button';
import Input from 'components/inputs/Input';
import Icon from 'components/Icon';
import Link from 'components/Link';
import ICONS from 'config/icons';
import { FONT_SIZE, FONT_WEIGHT, TRANSITION } from 'config/variables';
import colors from 'config/colors';
import Title from 'views/Wallet/components/Title';
import P from 'components/Paragraph';
import Content from 'views/Wallet/components/Content';
import { inject, observer } from 'mobx-react';
import QrModal from 'components/modals/QrModal';
import ConfirmAction from 'components/modals/confirm/Action';
import type { parsedURI } from 'utils/cryptoUriParser';
import { FADE_IN } from 'config/animations';
import type { FeeLevel, FeeLevelInfo } from 'utils/types/fee';

// TODO: Decide on a small screen width for the whole app
// and put it inside config/variables.js
const SmallScreenWidth = '850px';

const AmountInputLabelWrapper = styled.div`
    display: flex;
    justify-content: space-between;
`;

const AmountInputLabel = styled.span`
    text-align: right;
    color: ${colors.TEXT_SECONDARY};
`;

const InputRow = styled.div`
    padding-bottom: 28px;
`;

const SetMaxAmountButton = styled(Button)`
    height: 40px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: ${FONT_SIZE.SMALL};
    font-weight: ${FONT_WEIGHT.SMALLEST};
    color: ${colors.TEXT_SECONDARY};

    border-radius: 0;
    border: 1px solid ${colors.DIVIDER};
    border-right: 0;
    border-left: 0;
    background: transparent;
    transition: ${TRANSITION.HOVER};

    &:hover {
        background: ${colors.GRAY_LIGHT};
    }

    ${props => props.isActive && css`
        color: ${colors.WHITE};
        background: ${colors.GREEN_PRIMARY};
        border-color: ${colors.GREEN_PRIMARY};

        &:hover {
            background: ${colors.GREEN_SECONDARY};
        }

        &:active {
            background: ${colors.GREEN_TERTIARY};
        }
    `}
`;

const CurrencySelect = styled(Select)`
    min-width: 77px;
    height: 40px;
    flex: 0.2;
`;

const FeeOptionWrapper = styled.div`
    display: flex;
    justify-content: space-between;
`;

const OptionValue = styled(P)`
    flex: 1 0 auto;
    min-width: 70px;
    margin-right: 5px;
`;

const OptionLabel = styled(P)`
    flex: 0 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
    word-break: break-all;
`;

const FeeLabelWrapper = styled.div`
    display: flex;
    align-items: center;
    padding-bottom: 10px;
`;

const FeeLabel = styled.span`
    color: ${colors.TEXT_SECONDARY};
`;

const UpdateFeeWrapper = styled.span`
    margin-left: 8px;
    display: flex;
    align-items: center;
    font-size: ${FONT_SIZE.SMALL};
    color: ${colors.WARNING_PRIMARY};
`;

const StyledLink = styled(Link)`
    margin-left: 4px;
    white-space: nowrap;
`;

const ToggleAdvancedSettingsWrapper = styled.div`
    min-height: 40px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    @media screen and (max-width: ${SmallScreenWidth}) {
        ${props => (props.isAdvancedSettingsHidden && css`
            flex-direction: column;
        `)}
    }
`;

const ToggleAdvancedSettingsButton = styled(Button)`
    min-height: 40px;
    padding: 0;
    display: flex;
    flex: 1 1 0;
    align-items: center;
    font-weight: ${FONT_WEIGHT.SEMIBOLD};
`;

const FormButtons = styled.div`
    display: flex;
    flex: 1 1;

    
    @media screen and (max-width: ${SmallScreenWidth}) {
        margin-top: ${props => (props.isAdvancedSettingsHidden ? '10px' : 0)};
    }

    Button + Button {
        margin-left: 5px;
    }
`;

const SendButton = styled(Button)`
  flex: 1;
  margin-right: 5px;
  width: 100px;
`;

const ClearButton = styled(Button)`

`;

const AdvancedSettingsIcon = styled(Icon)`
    margin-left: 10px;
`;

const QrButton = styled(Button)`
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-left: 0px;
    height: 40px;
    padding: 0 10px;
`;

const ModalContainer = styled.div`
    position: fixed;
    z-index: 10000;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    padding: 20px;
    animation: ${FADE_IN} 0.3s;
`;

const ModalWindow = styled.div`
    margin: auto;
    position: relative;
    border-radius: 4px;
    background-color: ${colors.WHITE};
    text-align: center;
`;

type EthereumTxRequest = {
  network: string;
  token: ?Token;
  from: string;
  to: string;
  amount: string;
  data: string;
  gasLimit: string;
  gasPrice: string;
  nonce: number;
}

class AccountSend extends React.Component<Props> {
  constructor(props) {
    super(props);

    const { sendActions } = this.props;
    sendActions.setNetworkby('eth');
  }

  componentDidMount(): void {
    const { sendActions } = this.props;
    sendActions.updateEthereumFeeLevels().then();
  }

  // onSetMax() {
  //   // TODO: 计算 max 并设置 this.state.amount
  //   this.setState({isSetMax: !this.state.isSetMax})
  // }

  render() {
    const { appState, sendStore, sendActions } = this.props;
    const { wallet, eWalletDevice } = this.props.appState;
    const {accountEth, rates } = wallet;
    const {feeLevels} = sendStore;
    if (!accountEth || !rates || !feeLevels) {
      const loader = {
        type: 'progress',
        title: 'Loading account',
      };
      return <Content loader={loader} isLoading />;
    }

    if (!!appState.wallet.buttonRequest_SignTx) {
      return (
        <ModalContainer>
          <ModalWindow>
            <ModalContainer>
              <ModalWindow>
                <ConfirmAction device={eWalletDevice.device} />
              </ModalWindow>
            </ModalContainer>
          </ModalWindow>
        </ModalContainer>
      )
    }

    if (appState.wallet.buttonRequest_ConfirmOutput) {
      return (
        <ModalContainer>
          <ModalWindow>
            <ConfirmAction device={eWalletDevice.device} />
          </ModalWindow>
        </ModalContainer>
      )
    }

    if (sendStore.isQrScanning) {
      return (
        <ModalContainer>
          <ModalWindow>
            <QrModal
              onCancel={() => sendActions.onQrScanCancel()}
              onScan={parsedUri => sendActions.onQrScan(parsedUri)}
            />
          </ModalWindow>
        </ModalContainer>
      )
    }

    const currencySelectOption = [
      { value: sendStore.network.shortcut, label: sendStore.network.shortcut },
    ];

    return (
      <Content>
        <Title>Send Ethereum(ETH)</Title>
        <InputRow>
          <Input
            state={sendStore.addressInputState}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            topLabel="Address"
            bottomText={sendStore.addressMessage}
            value={sendStore.address}
            onChange={event => sendActions.onAddressChange(event.target.value)}
            sideAddons={[(
              <QrButton
                key="qrButton"
                isWhite
                onClick={() => sendActions.openQrModal()}
              >
                <Icon
                  size={25}
                  color={colors.TEXT_SECONDARY}
                  icon={ICONS.QRCODE}
                />
              </QrButton>
            )]}
          />
        </InputRow>
        <InputRow>
          <Input
            state={sendStore.amountInputState}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            topLabel={(
              <AmountInputLabelWrapper>
                <AmountInputLabel>Amount</AmountInputLabel>
              </AmountInputLabelWrapper>
            )}
            value={sendStore.amount}
            onChange={event => sendActions.onAmountChange(event.target.value)}
            bottomText={sendStore.amountMessage}
            sideAddons={[
              // (
              //   <SetMaxAmountButton
              //     key="icon"
              //     onClick={() => this.onSetMax()}
              //     isActive={this.state.isSetMax}
              //   >
              //     {!this.state.isSetMax && (
              //       <Icon
              //         icon={ICONS.TOP}
              //         size={25}
              //         color={colors.TEXT_SECONDARY}
              //       />
              //     )}
              //     {this.state.isSetMax && (
              //       <Icon
              //         icon={ICONS.CHECKED}
              //         size={25}
              //         color={colors.WHITE}
              //       />
              //     )}
              //     Set max
              //   </SetMaxAmountButton>
              // ),
              (
                <CurrencySelect
                  key="currency"
                  isSearchable={false}
                  isClearable={false}
                  value={currencySelectOption}
                  isDisabled={true}
                  // onChange={onCurrencyChange}
                  options={[currencySelectOption]}
                />
              )
            ]}
          />
        </InputRow>
        <InputRow>
          <FeeLabelWrapper>
            <FeeLabel>Fee</FeeLabel>
          </FeeLabelWrapper>
          <Select
            isSearchable={false}
            isClearable={false}
            value={sendStore.selectedFeeLevel}
            onChange={(selectedFee) => sendActions.onFeeLevelChange(selectedFee)}
            options={feeLevels}
            formatOptionLabel={option => (
              <FeeOptionWrapper>
                <OptionValue>{option.value}</OptionValue>
                <OptionLabel>{option.label}</OptionLabel>
              </FeeOptionWrapper>
            )}
          />
        </InputRow>

        <ToggleAdvancedSettingsWrapper isAdvancedSettingsHidden>
          <FormButtons isAdvancedSettingsHidden>
            <ClearButton
              isWhite
              isDisabled={sendStore.isSending}
              onClick={() => sendActions.onClear()}
            >
              Clear
            </ClearButton>
            <SendButton
              isDisabled={sendStore.isSending}
              onClick={() => sendActions.onSend()}
            >
              Send
            </SendButton>
          </FormButtons>
        </ToggleAdvancedSettingsWrapper>
      </Content>
    );
  }
}

AccountSend.propTypes = {
};

export default inject((stores) => {
  return {
    appState: stores.appState,
    sendStore: stores.sendStore,
    sendActions: stores.sendActions,
  };
})(observer(AccountSend));
