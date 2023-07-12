"use client";

import { styled } from "styled-components";

export default function Home() {
  return (
    <Main>
      <Topbar />
      <Body>
        <Toolbar></Toolbar>
        <Result />
      </Body>
    </Main>
  );
}

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Topbar = styled.header`
  height: 60px;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  border-top: 2px solid rgba(128, 128, 128, 0.1);
`;

const Toolbar = styled.div`
  width: 300px;
  /* background-color: rgba(128, 128, 128, 0.1); */
  border-right: 2px solid rgba(128, 128, 128, 0.1);
`;
const Result = styled.div`
  flex: 1;
  min-height: 80vh;
`;
