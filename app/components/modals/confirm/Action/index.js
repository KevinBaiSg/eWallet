/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { H3 } from 'components/Heading';
import DeviceIcon from 'components/images/DeviceIcon';
import type { TrezorDevice } from 'flowtype';
import { withNamespaces } from "react-i18next";

type Props = {
  device: TrezorDevice;
}

const Wrapper = styled.div``;

const Header = styled.div`
    padding: 48px;
`;

const ConfirmAction = (props: Props) => {
  const { t } = props;
  return (
    <Wrapper>
      <Header>
        <DeviceIcon device={props.device} size={100}/>
        <H3>{ t('Confirm action on your Device') }</H3>
      </Header>
    </Wrapper>
  )
};

ConfirmAction.propTypes = {
  device: PropTypes.object.isRequired
};


export default withNamespaces()(ConfirmAction);
