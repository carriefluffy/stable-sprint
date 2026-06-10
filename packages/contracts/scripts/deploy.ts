import { ethers, artifacts, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy ScoreRegistry
  const StableSprintScoreRegistry = await ethers.getContractFactory("StableSprintScoreRegistry");
  const registry = (await StableSprintScoreRegistry.deploy()) as any;
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("StableSprintScoreRegistry deployed to:", registryAddress);

  // Deploy Badges
  const StableSprintBadges = await ethers.getContractFactory("StableSprintBadges");
  const badges = (await StableSprintBadges.deploy()) as any;
  await badges.waitForDeployment();
  const badgesAddress = await badges.getAddress();
  console.log("StableSprintBadges deployed to:", badgesAddress);

  // Set Signer (to deployer by default, update later if needed)
  await registry.setSigner(deployer.address);
  console.log("Signer address set to deployer:", deployer.address);

  // Export addresses to root .env
  const envPath = path.join(__dirname, "../../../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Replace or append
    if (envContent.includes("VITE_SCORE_REGISTRY_ADDRESS=")) {
      envContent = envContent.replace(/VITE_SCORE_REGISTRY_ADDRESS=.*/, `VITE_SCORE_REGISTRY_ADDRESS=${registryAddress}`);
    } else {
      envContent += `\nVITE_SCORE_REGISTRY_ADDRESS=${registryAddress}`;
    }

    if (envContent.includes("VITE_BADGES_ADDRESS=")) {
      envContent = envContent.replace(/VITE_BADGES_ADDRESS=.*/, `VITE_BADGES_ADDRESS=${badgesAddress}`);
    } else {
      envContent += `\nVITE_BADGES_ADDRESS=${badgesAddress}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("Updated .env file with contract addresses");
  }

  // Generate ABIs for the web app
  const abiDir = path.join(__dirname, "../../../apps/web/src/abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  const registryArtifact = await artifacts.readArtifact("StableSprintScoreRegistry");
  fs.writeFileSync(
    path.join(abiDir, "StableSprintScoreRegistry.json"),
    JSON.stringify(registryArtifact.abi, null, 2)
  );

  const badgesArtifact = await artifacts.readArtifact("StableSprintBadges");
  fs.writeFileSync(
    path.join(abiDir, "StableSprintBadges.json"),
    JSON.stringify(badgesArtifact.abi, null, 2)
  );
  console.log("Exported ABIs to apps/web/src/abi");

  console.log("\nDeployment Verification Details:");
  console.log(`npx hardhat verify --network ${network.name} ${registryAddress}`);
  console.log(`npx hardhat verify --network ${network.name} ${badgesAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
