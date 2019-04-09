import styled from 'styled-components';
import { H1 } from 'components/Heading';
import Button from 'components/Button';
import Paragraph from 'components/Paragraph';
import React from 'react';
import { withNamespaces } from "react-i18next";
import { inject, observer } from 'mobx-react';
import ConfirmAction from 'components/modals/confirm/Action';
import { FADE_IN } from 'config/animations';
import colors from 'config/colors';
import Content from 'views/Wallet/components/Content';
import Input from 'components/inputs/Input';

const InputRow = styled.div`
    padding-bottom: 28px;
`;

const SendButton = styled(Button)`
  margin-right: 5px;
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

class Recovery extends React.Component<Props> {
  componentDidMount(): void {
    const { initializeActions } = this.props;
    initializeActions.onRecoverWallet();
  }

  render() {
    const { initializeActions, initializeStore, appState, t } = this.props;

    if (!!initializeStore.finished) {
      initializeActions.reset();
      const id = appState.eWalletDevice.features.device_id;
      this.props.history.replace(`/device/${id}`);
      return null
    }

    return (
      <Content>
        {!!initializeStore.buttonRequest &&
        <ModalContainer>
          <ModalWindow>
            <ConfirmAction device={appState.eWalletDevice.device} />
          </ModalWindow>
        </ModalContainer>}
        <H1>{t('Recover your wallet')}</H1>
        <StyledParagraph>
          {t('Follow the instructions on your device.')}
        </StyledParagraph>
        <InputRow>
          <Input
            topLabel={t('You might be asked to retype some words that are not part of your recovery seed.')}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            isDisabled={!!initializeStore.wordInputIsDisable}
            value={initializeStore.word}
            onChange={event => initializeActions.onRecoveryWordChange(event.target.value)}
          />
        </InputRow>
        <SendButton
          isDisabled={!!initializeStore.wordInputIsDisable && !initializeStore.tryAgain}
          onClick={() => initializeActions.onClickWordConfirm()}
        >
          {initializeStore.buttonText}
        </SendButton>
      </Content>
    )
  }
}

export default withNamespaces()(inject((stores) => {
  return {
    appState: stores.appState,
    initializeStore: stores.initializeStore,
    initializeActions: stores.initializeActions,
  };
})(observer(Recovery)));
