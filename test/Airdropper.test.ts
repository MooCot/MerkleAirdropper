import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("Airdropper contract", function () {
    let Token: any;
    let token: any;
    let Airdropper: any;
    let airdropper: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Деплой ERC20 токена
        const Token = await ethers.getContractFactory("ERC20Mock");
        token = await Token.deploy("Test Token", "TST", ethers.parseEther("1000"));
        await token.waitForDeployment();

        // Генерация Merkle Tree
        const addresses = [
            { address: addr1.address, amount: 100 },
            { address: addr2.address, amount: 200 },
        ];

        const leaves = addresses.map(entry =>
            keccak256(ethers.solidityPacked(["address", "uint256"], [entry.address, entry.amount]))
        );
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const merkleRoot = ethers.hexlify(tree.getRoot());

        // Деплой контракта Airdropper
        Airdropper = await ethers.getContractFactory("Airdropper");
        airdropper = await Airdropper.deploy(token.target, merkleRoot);
        await airdropper.waitForDeployment();
    });

    it("Should deploy the contract", async function () {
        expect(await airdropper.token()).to.equal(token.target);
    });

 it("Should allow a valid claim", async function () {
        const addresses = [
            { address: addr1.address, amount: 100 },
            { address: addr2.address, amount: 200 },
        ];

        // Создание Merkle Tree
        const leaves = addresses.map(entry =>
            keccak256(ethers.solidityPacked(["address", "uint256"], [entry.address, entry.amount])) // Хешируем данные
        );
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

        // Преобразование корня дерева
        const merkleRoot = ethers.hexlify(tree.getRoot());

        // Убедимся, что корень совпадает с корнем в контракте
        const contractMerkleRoot = await airdropper.merkleRoot();
        expect(contractMerkleRoot).to.equal(merkleRoot);

        // Генерация proof для addr1
        const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [addr1.address, 100])); // Хешируем
        const proof = tree.getHexProof(leaf); // Генерация proof

        console.log("Proof:", proof);

        // Баланс до выполнения claim
        const balanceBefore = await token.balanceOf(addr1.address);
        const airdropAmount = ethers.parseEther("1000");  // Например, 1000 токенов
        await token.transfer(airdropper.target, airdropAmount);
        // Выполняем claim
        await expect(airdropper.connect(addr1).claim(100, proof)).not.to.be.reverted;

        // Баланс после выполнения claim
        const balanceAfter = await token.balanceOf(addr1.address);
        // Проверка, что баланс увеличился на 100
        expect(balanceAfter.toString()).to.equal(
            (100).toString()
        );
});

    
    
    

    it("Should not allow a claim twice", async function () {
        const addresses = [
            { address: addr1.address, amount: 100 },
            { address: addr2.address, amount: 200 },
        ];
        const airdropAmount = ethers.parseEther("1000");  // Например, 1000 токенов
        await token.transfer(airdropper.target, airdropAmount);
        const leaves = addresses.map(entry =>
            keccak256(ethers.solidityPacked(["address", "uint256"], [entry.address, entry.amount]))
        );
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const proof = tree.getProof(leaves[0]).map(x => x.data);

        await airdropper.connect(addr1).claim(100, proof);

        await expect(airdropper.connect(addr1).claim(100, proof)).to.be.revertedWith("Airdrop already claimed.");
    });

    it("Should fail with invalid proof", async function () {
        const invalidProof = ["0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"]; // Неверный proof

        await expect(airdropper.connect(addr1).claim(100, invalidProof)).to.be.revertedWith("Invalid proof.");
    });
});
