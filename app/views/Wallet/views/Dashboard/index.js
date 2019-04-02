import React from 'react';
import styled from 'styled-components';

import {
  inject,
  observer
} from 'mobx-react';

import PropTypes from 'prop-types';
import { AppState } from 'store';

import Content from 'views/Wallet/components/Content';

import BtcIcon from 'images/coins/btc.png';
import EthIcon from 'images/coins/eth.png';

import { H1 } from 'components/Heading';
import Paragraph from 'components/Paragraph';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const Row = styled.div`
    flex: 1;
    display: flex;
    padding: 50px 0;
    
    flex-direction: column;
    align-items: center;
`;

const StyledP = styled(Paragraph)`
    padding: 0 0 15px 0;
    text-align: center;
`;

const Overlay = styled.div`
    display: flex;
    width: 100%;
    height: 40px;
    justify-content: center;
    align-items: center;
    opacity: 0.2;
    background: white;
`;

const Image = styled.img`
    margin-right: 10px;

    &:last-child {
        margin-right: 0px;
    }
`;

const Dashboard = () => (
  <Content>
    <Wrapper>
      <Row>
        <H1>Please select your coin</H1>
        <StyledP>You will gain access to receiving &amp; sending selected coin</StyledP>
        <Overlay>
          <Image src={BtcIcon} width={25}/>
          <Image src={EthIcon} width={20}/>
        </Overlay>
      </Row>
    </Wrapper>
  </Content>
);

Dashboard.propTypes = {};

export default Dashboard;
