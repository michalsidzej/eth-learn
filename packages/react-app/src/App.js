import { useEthers } from "@usedapp/core"
import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "./pages/Home"
import { Body, Container, Header } from "./components"
import { WalletButton } from "./components/WalletButton"

function App() {
  const { account } = useEthers()

  return (
    <Container>
      <Header>
        <WalletButton />
      </Header>
      <Body>
        {account ? (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </BrowserRouter>
        ) : (
          <p>Connect your wallet to start learning!</p>
        )}
      </Body>
    </Container>
  )
}

export default App
