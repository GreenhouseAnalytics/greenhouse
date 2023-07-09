import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  /* Light colors */
  :root {
  --primary: #426915;
  --on-primary: #ffffff;
  --primary-container: #c2f18e;
  --on-primary-container: #0f2000;
  --secondary: #57624a;
  --on-secondary: #ffffff;
  --secondary-container: #dbe7c8;
  --on-secondary-container: #151e0b;
  --tertiary: #386663;
  --on-tertiary: #ffffff;
  --tertiary-container: #bbece8;
  --on-tertiary-container: #00201f;
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --on-error: #ffffff;
  --on-error-container: #410002;
  --background: #fdfcf5;
  --on-background: #1b1c18;
  --surface: #fdfcf5;
  --on-surface: #1b1c18;
  --surface-variant: #e1e4d5;
  --on-surface-variant: #44483d;
  --outline: #75796c;
  --inverse-on-surface: #f2f1ea;
  --inverse-surface: #30312c;
  --inverse-primary: #a7d475;
  --shadow: #000000;
  --surface-tint: #426915;
  --outline-variant: #c4c8ba;
  --scrim: #000000;
  }

  /* Dark theme */
  @media (prefers-color-scheme: dark) {
    :root {
      --primary: #a7d475;
      --on-primary: #1d3700;
      --primary-container: #2d5000;
      --on-primary-container: #c2f18e;
      --secondary: #bfcbad;
      --on-secondary: #2a331f;
      --secondary-container: #404a33;
      --on-secondary-container: #dbe7c8;
      --tertiary: #a0cfcc;
      --on-tertiary: #003735;
      --tertiary-container: #1f4e4c;
      --on-tertiary-container: #bbece8;
      --error: #ffb4ab;
      --error-container: #93000a;
      --on-error: #690005;
      --on-error-container: #ffdad6;
      --background: #1b1c18;
      --on-background: #e3e3db;
      --surface: #1b1c18;
      --on-surface: #e3e3db;
      --surface-variant: #44483d;
      --on-surface-variant: #c4c8ba;
      --outline: #8e9285;
      --inverse-on-surface: #1b1c18;
      --inverse-surface: #e3e3db;
      --inverse-primary: #426915;
      --shadow: #000000;
      --surface-tint: #a7d475;
      --outline-variant: #44483d;
      --scrim: #000000;
    }
  }


  body {
    margin: 0;
    padding: 0;
    font-size: 18px;
    font-family: ${({ theme }) => theme.font};
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.onBackground};
  }
`;
