import "./index.css";

import { DAppProvider, Hardhat, Localhost } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import { AppWithRouter } from "./App";

const config = {
  readOnlyChainId: Hardhat.chainId,
  readOnlyUrls: {
    [Hardhat.chainId]: "http://127.0.0.1:8545",
  },

  
};

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <AppWithRouter />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
