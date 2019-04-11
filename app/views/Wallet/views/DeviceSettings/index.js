
import styled from 'styled-components';
import { H1, H3 } from 'components/Heading';
import Button from 'components/Button';
import Paragraph from 'components/Paragraph';
import React from 'react';
import { withNamespaces } from "react-i18next";
import { inject, observer } from 'mobx-react';
import ConfirmAction from 'components/modals/confirm/Action';
import { FADE_IN } from 'config/animations';
import colors from 'config/colors';
import Content from 'views/Wallet/components/Content';
import { FONT_SIZE, FONT_WEIGHT } from 'config/variables';
import Icon from 'components/Icon';
import ICONS from 'config/icons';
import Input from 'components/inputs/Input';

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: left;
`;

const Row = styled.div`
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    align-items: left;
`;

const StyledParagraph = styled(Paragraph)`
    padding: 0 0 15px 0;
    text-align: left;
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

const Label = styled.div`
    float: left;
    font-size: ${FONT_SIZE.SMALL};
    color: ${colors.TEXT_SECONDARY};
`;

const InputRow = styled.div`
    padding-bottom: 28px;
    max-width: 280px;
`;

const ButtonChange = styled.div`
    padding-bottom: 28px;
`;

const ButtonWipe = styled.div`
    padding-bottom: 28px;
`;

class DeviceSettings extends React.Component<Props> {
  componentDidMount(): void {
    const { deviceSettingActions } = this.props;
    deviceSettingActions.onInit();
  }
  render() {
    const { deviceSettingActions, deviceSettingStore, appState, t } = this.props;
    const { label } = deviceSettingStore;
    return (
      <Content>
        {!!deviceSettingStore.buttonRequest &&
        <ModalContainer>
          <ModalWindow>
            <ConfirmAction device={appState.eWalletDevice.device} />
          </ModalWindow>
        </ModalContainer>}
        {!!deviceSettingStore.reconnectRequest_WipeDevice &&
        <ModalContainer>
          <ModalWindow>
            <ConfirmAction device={appState.eWalletDevice.device} />
          </ModalWindow>
        </ModalContainer>}
        <Wrapper>
          <Column>
            <H1>
              {t('Basic device settings')}
            </H1>
            <InputRow>
              <Input
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                topLabel={t('Name')}
                value={label}
                onChange={event => deviceSettingActions.onLabelChange(event.target.value)}
                sideAddons={[(
                  <Button
                    key="editButton"
                    isDisabled={!deviceSettingStore.isEdited}
                    onClick={() => deviceSettingActions.changeLabel()}
                  >
                    {t('Rename')}
                  </Button>
                )]}
              />
            </InputRow>
            <H1>
              {t('PIN')}
            </H1>
            <ButtonChange>
              <Button
                key="changePinButton"
                onClick={() => deviceSettingActions.changePIN()}
              >
                {t('Change PIN')}
              </Button>
            </ButtonChange>
            <H1>
              {t('Wipe device')}
            </H1>
            <StyledParagraph>
              {t('Wiping the device removes all its information.')}
              {t('Only wipe your device if you have your recovery seed at hand or there are no funds stored on this device.')}
            </StyledParagraph>
            <ButtonWipe>
              <Button
                key="wipeDeviceButton"
                isRed
                onClick={() => deviceSettingActions.wipeDevice()}
              >
                <Icon
                  size={25}
                  color={colors.WHITE}
                  icon={ICONS.WARNING}
                />
                {t('Wipe Device')}
              </Button>
            </ButtonWipe>
          </Column>
        </Wrapper>
      </Content>
    )
  }
};

export default withNamespaces()(inject((stores) => {
  return {
    appState: stores.appState,
    deviceSettingActions: stores.deviceSettingActions,
    deviceSettingStore: stores.deviceSettingStore,
  };
})(observer(DeviceSettings)));
