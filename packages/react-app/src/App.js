import { useQuery } from "@apollo/client"
import { useEthers } from "@usedapp/core"
import React, { useEffect } from "react"

import { Body, Container, Header, Image } from "./components"
import logo from "./ethereumLogo.png"
import { WalletButton } from "./components/WalletButton"

function Main() {
  return <p>Main</p>
}

function App() {
  const { account } = useEthers()

  return (
    <Container>
      <Header>
        <WalletButton />
      </Header>
      <Body>
        <Image src={logo} alt="ethereum-logo" />
        {account ? <Main /> : <p>Connect your wallet to start learning!</p>}
      </Body>
    </Container>
  )
}

export default App
