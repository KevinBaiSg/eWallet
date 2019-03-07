/* @flow */

import styled from 'styled-components';
import PropTypes from 'prop-types';
import React from 'react';
import Link from 'components/Link';
import { getYear } from 'date-fns';
import colors from 'config/colors';
import { FONT_SIZE } from 'config/variables';
import { inject, observer } from 'mobx-react';

declare var COMMITHASH: string;

type Props = {
    opened: boolean,
    isLanding: boolean,
}

const Wrapper = styled.div`
    width: 100%;
    font-size: ${FONT_SIZE.SMALL};
    background: ${colors.LANDING};
    color: ${colors.TEXT_SECONDARY};
    padding: 10px 30px;
    display: flex;
    height: 59px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid ${colors.BACKGROUND};

    @media all and (max-width: 850px) {
        justify-content: center;
    }
`;

const StyledLink = styled(Link)`
    margin: 0 10px;
    white-space: nowrap;
`;

const Copy = styled.div`
    white-space: nowrap;
    margin-right: 10px;
`;

const Left = styled.div`
    display: flex;
`;

const Right = styled.div`
    white-space: nowrap;
    margin: 0 10px;
`;

const Footer = ({ opened, isLanding }: Props) => (
    <Wrapper>
        <Left>
            <Copy title={COMMITHASH}>&copy; {getYear(new Date())}</Copy>
            <StyledLink href="http://satoshilabs.com" isGreen>eWallet</StyledLink>
        </Left>
        {!isLanding && (
            <Right>
                Exchange rates by <Link href="https://www.coingecko.com" isGreen>Coingecko</Link>
            </Right>
        )}
    </Wrapper>
);

Footer.propTypes = {
  opened: PropTypes.bool.isRequired,
  isLanding: PropTypes.bool,
};

export default inject((stores) => {
  return {};
})(observer(Footer));
