"use client";
import Image from "next/image";
import React, { useCallback } from "react";
import { styled } from "styled-components";
import { signOut } from "next-auth/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const handleSignOut = useCallback(() => signOut(), []);

  return (
    <Page>
      <Header>
        <div className="logo">
          <Image src="/logos/dark_green.png" width="32" height="32" alt="" />
          Greenhouse
        </div>
        <Nav>
          <ul>
            <li>Explore</li>
            <li>Events</li>
            <li>Users</li>
            <li className="account">
              <LinkButton onClick={handleSignOut}>Sign out</LinkButton>
            </li>
          </ul>
        </Nav>
      </Header>
      <Main>{children}</Main>
    </Page>
  );
}

const Page = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  flex: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #fff;
  /* background-color: #1b5646; */
  /* background-color: #194f50; */
  gap: 25px;
  padding: 12px 14px 12px 12px;
  font-family: ${({ theme }) => theme.logoFont};

  .logo {
    flex: 0;
    font-size: 22px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
`;

const Nav = styled.nav`
  flex: 1;

  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
    display: flex;
    flex-direction: row;
    gap: 14px;
    font-size: 14px;
  }

  .account {
    flex: 1;
    text-align: right;
  }
`;

const LinkButton = styled.button`
  appearance: none;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  color: #fff;
  font-size: inherit;
  cursor: pointer;
`;

const Main = styled.main`
  overflow: auto;
  flex: 1;
  display: flex;
`;
