import { ethers } from "hardhat";
import { Airdropper__factory } from "../typechain-types";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const tokenAddress = "0xYourERC20TokenAddress"; // Адрес токена ERC20
    const merkleRoot = "0xYourMerkleRoot"; // Корень Merkle Tree

    const airdropperFactory = new Airdropper__factory(deployer);
    const airdropper = await airdropperFactory.deploy(tokenAddress, merkleRoot);

    console.log("Airdropper contract deployed to:", airdropper.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});