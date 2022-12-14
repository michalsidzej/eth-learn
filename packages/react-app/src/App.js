import { useEthers, useContractFunction } from "@usedapp/core";
import { addresses, abis } from "@my-app/contracts";
import React, { useReducer } from "react";
import { utils } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { Link } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import {
  Body,
  Container,
  Header,
  Image,
  Form,
  InputsContainer,
  Input,
  Label,
} from "./components";
import { WalletButton } from "./components/WalletButton";
import Deploy from "./components/Learn";

function getContract() {
  const address = addresses.CampaignCreator;
  const abi = abis.CampaignCreator;
  const campaignCreatorInterface = new utils.Interface(abi.abi);
  const campaignCreatorContract = new Contract(
    address,
    campaignCreatorInterface
  );
  return campaignCreatorContract;
}

function useCampaignCreator(funcName) {
  const contract = getContract();
  return useContractFunction(contract, funcName);
}

const formReducer = (state, event) => {
  return {
    ...state,
    [event.name]: event.value,
  };
};

function InputWithLabel(props) {
  return (
    <>
      <Label>{props.name}</Label>
      <Input name={props.name} onChange={props.onChange} />
    </>
  );
}

function CreateCampaign() {
  const { state, send } = useCampaignCreator("createCampaign");
  const [formData, setFormData] = useReducer(formReducer, {});

  function createCampaign(student, amount, untilTimestamp, payout) {
    console.log(student, amount, untilTimestamp, payout);
    send(student, untilTimestamp, payout, { value: utils.parseEther(amount) });
  }

  const handleChange = (event) => {
    setFormData({
      name: event.target.name,
      value: event.target.value,
    });
  };

  function onSubmit(e) {
    e.preventDefault();
    createCampaign(
      formData.student,
      formData.amount,
      formData.untilTimestamp,
      formData.payout
    );
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
  );
}

function Main() {
  return <CreateCampaign />;
}

function App() {
  const { account } = useEthers();

  return (
    <Container>
      <Body>
        {/* {account ? <Main /> : <p>Connect your wallet to start learning!</p>} */}
        {account ? (
          <div>
            <h3>Copy this link</h3>
            <h3>Share it with your parent</h3>
            <h3>Start (L)earning</h3>
            <span style={{ color: "#90ee90" }}>
              http://localhost:3000/{account}
            </span>{" "}
            <button
              onClick={() => {
                console.log(account)
                navigator.clipboard.writeText(
                  `http://localhost:3000/learn/${account}`
                );
              }}
            >
              ????
            </button>
          </div>
        ) : (
          <p>Connect your wallet to start learning!</p>
        )}
        {/* {account} */}
        {/* {{ account }} */}
      </Body>
    </Container>
  );
}

export function AppWithRouter() {
  return (
    <Container>
      <Header>
        <WalletButton />
      </Header>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}></Route>
          <Route path="/learn/:id" element={<Deploy />} />
        </Routes>
      </BrowserRouter>
    </Container>
  );
}

export default App;
