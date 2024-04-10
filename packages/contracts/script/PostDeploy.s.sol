// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { registerERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/registerERC20.sol";
import { ERC20MetadataData } from "@latticexyz/world-modules/src/modules/erc20-puppet/tables/ERC20Metadata.sol";
import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";
import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";

import { MATERIAL_TYPE } from "../src/codegen/common.sol";
import { LibOrder, LibInitRecipes, LibInitEscapeRankNames, LibInit, LibOffer } from "../src/libraries/Libraries.sol";
import { ONE_MINUTE, ONE_DAY, ONE_HOUR } from "../src/constants.sol";

uint256 constant POOL_SUPPLY = 1_000_000 wei;

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Specify a store so that you can use tables directly in PostDeploy
    StoreSwitch.setStoreAddress(worldAddress);

    IWorld world = IWorld(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    // Register and mint ERC20 token
    IERC20Mintable token = registerERC20(
      world,
      "Token",
      ERC20MetadataData({ decimals: 18, name: "TCM", symbol: "TCM" })
    );

    token.mint(worldAddress, POOL_SUPPLY);

    // Register ERC721 escaped stump token
    IERC721Mintable escapedStumpToken = registerERC721(
      world,
      "EscapedStumpT",
      ERC721MetadataData({ name: "TCM", symbol: "TCM", baseURI: "" })
    );

    // Initialize gameConfig and tutorial levels
    // Root namespace owner is admin
    LibInit.init(NamespaceOwner.get(ROOT_NAMESPACE_ID), address(token), address(escapedStumpToken));

    // Initialize recipes
    LibInitRecipes.init();

    // Initialize rank names for escaped pod NFTs
    LibInitEscapeRankNames.init();

    // Create offer
    LibOffer.create(MATERIAL_TYPE.BUG, 10000, 100); // 1:1 ratio : 100 $BUG => 10000 Bug (Shown as 100 Bugs with scale-down in UI)

    vm.stopBroadcast();
  }
}
