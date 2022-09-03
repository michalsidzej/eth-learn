import "./index.css"

import { DAppProvider, Localhost } from "@usedapp/core"
import React from "react"
import ReactDOM from "react-dom"

import App from "./App"

const config = {
  readOnlyChainId: Localhost.chainId,
  readOnlyUrls: {
    [Localhost.chainId]: "http://127.0.0.1:8545",
  },
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
)
