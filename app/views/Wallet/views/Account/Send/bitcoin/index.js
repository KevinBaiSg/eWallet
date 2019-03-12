/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
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
// import AdvancedForm from './components/AdvancedForm';
// import PendingTransactions from '../components/PendingTransactions';
import { inject, observer } from 'mobx-react';
import { isValidAddress } from 'utils/addressUtils';

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

class AccountSend extends React.Component<Props> {
  state = {
    // for address
    address: '',
    addressErrors: null,
    addressWarnings: null,
    addressInfos: null,
    // for amount
    amount: '',
    amountErrors: null,
    amountWarnings: null,
    amountInfos: null,
    isSetMax: false,

    //
    selectedFeeLevel: null,
    feeLevels: null,
  };

  constructor(props) {
    super(props);

    const { network } = this.props.appState.wallet;

    this.state = {
      // for address
      address: '',
      addressErrors: null,
      addressWarnings: null,
      addressInfos: null,
      // for amount
      amount: '',
      amountErrors: null,
      amountWarnings: null,
      amountInfos: null,
      isSetMax: false,
      //
      feeLevels: [
        {
          value: 'Economy',
          label: network.defaultFees.Economy,
        },
        {
          value: 'High',
          label: network.defaultFees.High,
        },
        {
          value: 'Normal',
          label: network.defaultFees.Normal,
        },
        {
          value: 'Low',
          label: network.defaultFees.Low,
        }
      ],
      selectedFeeLevel: {
        value: 'Economy',
        label: network.defaultFees.Economy,
      },
    };

    this.getAddressInputState = this.getAddressInputState.bind(this);
    this.getAmountInputState = this.getAmountInputState.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onAmountChange = this.onAmountChange.bind(this);
    this.onSetMax = this.onSetMax.bind(this);
    this.onFeeLevelChange = this.onFeeLevelChange.bind(this);
    this.onClear = this.onClear.bind(this);
  }

  getAddressInputState(): string {
    let state = '';
    if (this.state.address && !this.state.addressErrors) {
      state = 'success';
    }
    if (this.state.addressWarnings && !this.state.addressErrors) {
      state = 'warning';
    }
    if (this.state.addressErrors) {
      state = 'error';
    }
    return state;
  };

  getAmountInputState(): string {
    let state = '';
    if (this.state.amountWarnings && !this.state.amountErrors) {
      state = 'warning';
    }
    if (this.state.amountErrors) {
      state = 'error';
    }
    return state;
  };

  onAddressChange(address: string) {
    const { network } = this.props.appState.wallet;

    this.setState({ address: address });
    if (address.length < 1) {
      this.setState({
        address: address,
        addressErrors: 'Address is not set',
      });
    } else if (!isValidAddress(address, network)) {
      this.setState({
        address: address,
        addressErrors: 'Address is not valid',
      });
    } else {
      this.setState({
        address: address,
        addressErrors: null,
        addressWarnings: null,
        addressInfos: null,
      });
    }
  }

  onAmountChange(amount: string) {
    this.setState({ amount: amount });
  }

  onSetMax() {
    // TODO: 计算 max 并设置 this.state.amount
    this.setState({isSetMax: !this.state.isSetMax})
  }

  onFeeLevelChange(selectedFee) {
    this.setState({selectedFeeLevel: selectedFee})
  }

  onClear() {
    this.setState({
      address: '',
      addressErrors: null,
      addressWarnings: null,
      addressInfos: null,
      // for amount
      amount: '',
      amountErrors: null,
      amountWarnings: null,
      amountInfos: null,
      isSetMax: false,
    })
  }

  render() {
    const { wallet } = this.props.appState;
    const {account, rates, network} = wallet;
    if (!account || !rates) {
      const loader = {
        type: 'progress',
        title: 'Loading account',
      };
      return <Content loader={loader} isLoading />;
    }

    const currencySelectOption = [
      { value: network.shortcut, label: network.shortcut },
    ];

    return (
      <Content>
        <Title>Send Bitcoin(BTC)</Title>
        <InputRow>
          <Input
            state={this.getAddressInputState()}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            topLabel="Address"
            bottomText={this.state.addressErrors || this.state.addressWarnings || this.state.addressInfos}
            value={this.state.address}
            onChange={event => this.onAddressChange(event.target.value)}
            sideAddons={[(
              <QrButton
                key="qrButton"
                isWhite
                // onClick={props.openQrModal}
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
            state={this.getAmountInputState()}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            topLabel={(
              <AmountInputLabelWrapper>
                <AmountInputLabel>Amount</AmountInputLabel>
              </AmountInputLabelWrapper>
            )}
            value={this.state.amount}
            onChange={event => this.onAmountChange(event.target.value)}
            bottomText={this.state.amountErrors || this.state.amountWarnings || this.state.amountInfos}
            sideAddons={[
              (
                <SetMaxAmountButton
                  key="icon"
                  onClick={() => this.onSetMax()}
                  isActive={this.state.isSetMax}
                >
                  {!this.state.isSetMax && (
                    <Icon
                      icon={ICONS.TOP}
                      size={25}
                      color={colors.TEXT_SECONDARY}
                    />
                  )}
                  {this.state.isSetMax && (
                    <Icon
                      icon={ICONS.CHECKED}
                      size={25}
                      color={colors.WHITE}
                    />
                  )}
                  Set max
                </SetMaxAmountButton>
              ),
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
            value={this.state.selectedFeeLevel}
            onChange={this.onFeeLevelChange}
            options={this.state.feeLevels}
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
              onClick={() => this.onClear()}
            >
              Clear
            </ClearButton>
            <SendButton
              isDisabled={false}
              // onClick={() => onSend()}
            >
              send
            </SendButton>
          </FormButtons>
        </ToggleAdvancedSettingsWrapper>
      </Content>
    );
  }
}

AccountSend.propTypes = {
  appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(AccountSend));
