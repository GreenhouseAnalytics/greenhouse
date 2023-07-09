"use client";

import React, { useState, useCallback } from "react";
import { useServerInsertedHTML } from "next/navigation";
import {
  ServerStyleSheet,
  StyleSheetManager,
  ThemeProvider as StyledThemeProvider,
} from "styled-components";
import { theme } from "./theme";
import GlobalStyle from "./GlobalStyle";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  /**
   * The styled provider to render
   */
  const Render = useCallback(() => {
    return (
      <StyledThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </StyledThemeProvider>
    );
  }, [children]);

  /**
   * Only load the stylesheet manager on the server-side
   */
  if (typeof window !== "undefined") return <Render />;
  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      <Render />
    </StyleSheetManager>
  );
}
