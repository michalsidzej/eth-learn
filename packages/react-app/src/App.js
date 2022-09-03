import { useEthers, useContractFunction } from "@usedapp/core"
import { addresses, abis } from "@my-app/contracts"
import React, { useReducer } from "react"
import { utils } from "ethers"
import { Contract } from "@ethersproject/contracts"

import {
  Body,
  Container,
  Header,
  Image,
  Form,
  InputsContainer,
  Input,
  Label,
} from "./components"
import logo from "./ethereumLogo.png"
import { WalletButton } from "./components/WalletButton"

function getContract() {
  const address = addresses.CampaignCreator
  const abi = abis.CampaignCreator
  const campaignCreatorInterface = new utils.Interface(abi.abi)
  const campaignCreatorContract = new Contract(
    address,
    campaignCreatorInterface
  )
  return campaignCreatorContract
}

function useCampaignCreator(funcName) {
  const contract = getContract()
  return useContractFunction(contract, funcName)
}

const formReducer = (state, event) => {
  return {
    ...state,
    [event.name]: event.value,
  }
}

function InputWithLabel(props) {
  return (
    <>
      <Label>{props.name}</Label>
      <Input name={props.name} onChange={props.onChange} />
    </>
  )
}

function CreateCampaign() {
  const { state, send } = useCampaignCreator("createCampaign")
  const [formData, setFormData] = useReducer(formReducer, {})

  function createCampaign(student, amount, untilTimestamp, payout) {
    console.log(student, amount, untilTimestamp, payout)
    send(student, untilTimestamp, payout, { value: utils.parseEther(amount) })
  }

  const handleChange = (event) => {
    setFormData({
      name: event.target.name,
      value: event.target.value,
    })
  }

  function onSubmit(e) {
    e.preventDefault()
    createCampaign(
      formData.student,
      formData.amount,
      formData.untilTimestamp,
      formData.payout
    )
  }

  return (
    <Form onSubmit={onSubmit}>
      <InputsContainer>
        <InputWithLabel name="student" onChange={handleChange} />
        <InputWithLabel name="amount" onChange={handleChange} />
        <InputWithLabel name="untilTimestamp" onChange={handleChange} />
        <InputWithLabel name="payout" onChange={handleChange} />
        <button type="submit">Submit</button>
      </InputsContainer>
    </Form>
  )
}

function Main() {
  return <CreateCampaign />
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
