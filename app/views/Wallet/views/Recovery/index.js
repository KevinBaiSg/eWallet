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

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 40px 35px 40px 35px;
`;

const Row = styled.div`
    dsplay: flex;
    flex-direction: row;
    align-items: center;
    padding: 50px 0;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 50px 0;
    width: 300px;
`;

const StyledParagraph = styled(Paragraph)`
    padding: 0 0 15px 0;
    text-align: center;
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

const Initialize = (props) => {
  const { initializeActions, initializeStore, appState, t } = props;

  if (!!initializeStore.finished) {
    initializeActions.reset();
    const id = appState.eWalletDevice.features.device_id;
    props.history.replace(`/device/${id}`);
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
      <Wrapper>
        <Column>
          <H1>{t('Create a new wallet')}</H1>
          <StyledParagraph>
            {t('Don\'t worry! We will walk you through the setup process in a few minutes.')}
          </StyledParagraph>
          <Button onClick={() => {initializeActions.onCreateWallet()}}>
            {t('Create a new wallet')}
          </Button>
        </Column>
        <Column>
          <H1>{t('Recover wallet')}</H1>
          <StyledParagraph>
            {t('Own a recovery seed from a different wallet or app? Simply restore the wallet from your backup.')}
          </StyledParagraph>
          <Button onClick={() => {initializeActions.onRecoverWallet()}}>
            {t('Recover wallet')}
          </Button>
        </Column>
      </Wrapper>
    </Content>
  )
};

export default withNamespaces()(inject((stores) => {
  return {
    appState: stores.appState,
    initializeStore: stores.initializeStore,
    initializeActions: stores.initializeActions,
  };
})(observer(Initialize)));
