"use client";
import React from "react";
import { styled } from "styled-components";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header>
        <div className="logo">Greenhouse</div>
        <nav></nav>
      </Header>
      <Main>{children}</Main>
    </>
  );
}

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.onSecondaryContainer};
  background-color: ${({ theme }) => theme.secondaryContainer};

  .logo {
    flex: 0;
    font-size: 18px;
    font-family: ${({ theme }) => theme.logoFont};
    padding: 8px 12px;
  }

  nav {
    flex: 1;
    padding: 8px 12px;
  }
`;

const Main = styled.main`
  margin: 60px 20px;
`;
