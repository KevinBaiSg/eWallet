/* @flow */
import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import colors from 'config/colors';
import { SCREEN_SIZE } from 'config/variables';
import type { toggleSidebar as toggleSidebarType } from 'actions/WalletActions';

const Wrapper = styled.header`
    width: 100%;
    height: 52px;
    background: ${colors.HEADER};
    overflow: hidden;
    z-index: 200;

    svg {
        fill: ${colors.WHITE};
        height: 28px;
        width: 100px;
    }
`;

const LayoutWrapper = styled.div`
    width: 100%;
    height: 100%;
    max-width: 1170px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media screen and (max-width: 1170px) {
        padding: 0 25px;
    }
`;

const Left = styled.div`
    display: none;
    flex: 0 0 33%;

    @media screen and (max-width: ${SCREEN_SIZE.SM}) {
        display: initial;
    }
`;

const MenuToggler = styled.div`
    display: none;
    white-space: nowrap;
    color: ${colors.WHITE};
    align-self: center;
    cursor: pointer;
    user-select: none;
    padding: 10px 0px;
    transition: all .1s ease-in;

    @media screen and (max-width: ${SCREEN_SIZE.SM}) {
        display: initial;
    }
`;

const Logo = styled.div`
    flex: 1;
    justify-content: flex-start;
    display: flex;

    @media screen and (max-width: ${SCREEN_SIZE.SM}) {
        flex: 1 0 33%;
        justify-content: center;
    }
`;

const MenuLinks = styled.div`
    flex: 0;

    @media screen and (max-width: ${SCREEN_SIZE.SM}) {
        flex: 0 1 33%;
    }
`;

const Projects = styled.div`

    @media screen and (max-width: ${SCREEN_SIZE.SM}) {
        display: none;
    }
`;

const A = styled.a`
    color: ${colors.WHITE};
    margin-left: 24px;
    transition: all .1s ease-in;

    &:visited {
        color: ${colors.WHITE};
        margin-left: 24px;
    }

    &:first-child {
        margin: 0px;
    }

    &:hover,
    &:active {
        color: ${colors.TEXT_SECONDARY};
    }
`;

type Props = {
    sidebarEnabled?: boolean,
    sidebarOpened?: boolean,
    toggleSidebar?: toggleSidebarType,

};

const Header = ({ sidebarEnabled, sidebarOpened, toggleSidebar }: Props) => (
    <Wrapper>
        <LayoutWrapper>
            <Left>
                { sidebarEnabled && <MenuToggler onClick={toggleSidebar}>{sidebarOpened ? '✕ Close' : '☰ Menu'}</MenuToggler>}
            </Left>
            <Logo>
                <NavLink to="/">
                    eWallet
                </NavLink>
            </Logo>
        </LayoutWrapper>
    </Wrapper>
);

export default Header;
