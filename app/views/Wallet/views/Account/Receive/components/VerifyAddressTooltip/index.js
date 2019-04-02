import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { withNamespaces } from "react-i18next";

const Wrapper = styled.div``;
const Content = styled.div``;

const VerifyAddressTooltip = ({ isConnected, isAvailable, addressUnverified, t }) => (
  <Wrapper>
    {addressUnverified && (
      <Content>
        Unverified address. {isConnected && isAvailable ? t('Show on Device') : t('Connect your Device to verify it.')}
      </Content>
    )}
    {!addressUnverified && (
      <Content>
        {isConnected ? t('Show on Device') : t('Connect your Device to verify address.')}
      </Content>
    )}
  </Wrapper>
);

VerifyAddressTooltip.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  isAvailable: PropTypes.bool.isRequired,
  addressUnverified: PropTypes.bool.isRequired
};


export default withNamespaces()(VerifyAddressTooltip);
