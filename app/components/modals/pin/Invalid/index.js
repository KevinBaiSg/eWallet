/* @flow */

import React from 'react';
import styled from 'styled-components';

import { H3 } from 'components/Heading';
import P from 'components/Paragraph';

const Wrapper = styled.div`
    padding: 30px 48px;
`;

const InvalidPin = () => (
  <Wrapper>
    <H3>Entered PIN for is not correct</H3>
    <P isSmaller>Retrying...</P>
  </Wrapper>
);

InvalidPin.propTypes = {
};

export default InvalidPin;
