import styled from 'styled-components';
import { H1 } from 'components/Heading';
import Button from 'components/Button';
import Paragraph from 'components/Paragraph';
import React from 'react';
import { withNamespaces } from "react-i18next";
import { inject, observer } from 'mobx-react';

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

const Initialize = (props) => {
  const { initializeActions, t } = props;
  return (
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
  )
};

export default withNamespaces()(inject((stores) => {
  return {
    appState: stores.appState,
    initializeStore: stores.initializeStore,
    initializeActions: stores.initializeActions,
  };
})(observer(Initialize)));
