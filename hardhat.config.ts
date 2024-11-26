import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "@typechain/hardhat";

dotenv.config(); // Загрузка переменных из .env файла

const config: HardhatUserConfig = {
  solidity: "0.8.20", // Укажите версию Solidity
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
  networks: {
    hardhat: {
      chainId: 31337, // Локальная сеть
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`, // Alchemy URL
      accounts: [process.env.PRIVATE_KEY || ""] // Приватный ключ вашего кошелька
    },
  },
};

export default config;