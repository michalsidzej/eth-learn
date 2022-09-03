import { useEthers } from "@usedapp/core"
import React from "react"

import { Home } from "./pages/Home"
import { Body, Container, Header, Image } from "./components"
import logo from "./ethereumLogo.png"
import { WalletButton } from "./components/WalletButton"

function App() {
  const { account } = useEthers()

  return (
    <Container>
      <Header>
        <WalletButton />
      </Header>
      <Body>
        <Image src={logo} alt="ethereum-logo" />
        {account ? <Home /> : <p>Connect your wallet to start learning!</p>}
      </Body>
    </Container>
  )
}

export default App
