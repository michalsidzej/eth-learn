require("@nomicfoundation/hardhat-toolbox")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    local: {
      chainId: 31337,
      url:  'http://127.0.0.1:8545/'
    }
  }
}
