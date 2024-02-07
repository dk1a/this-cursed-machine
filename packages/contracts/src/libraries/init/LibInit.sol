// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { GameConfig, GameConfigData, TutorialOrders } from "../../codegen/index.sol";
import { LibOrder } from "../LibOrder.sol";
import { MATERIAL_TYPE } from "../../codegen/common.sol";

library LibInit {
  function init(address tokenAddress) internal {
    // Set game config
    GameConfig.set(GameConfigData({ tokenAddress: tokenAddress, globalSpawnIndex: 0 }));

    // Create tutorial orders
    MATERIAL_TYPE[] memory goalMaterials = new MATERIAL_TYPE[](5);
    goalMaterials[0] = MATERIAL_TYPE.BLOOD;
    goalMaterials[1] = MATERIAL_TYPE.PISS;
    goalMaterials[2] = MATERIAL_TYPE.NESTLE_PURE_LIFE_BOTTLED_WATER;
    goalMaterials[3] = MATERIAL_TYPE.PURE_FAT;
    goalMaterials[4] = MATERIAL_TYPE.AESOP_ORGANIC_HAND_SOAP;

    uint32[] memory goalAmounts = new uint32[](5);
    goalAmounts[0] = 200;
    goalAmounts[1] = 500;
    goalAmounts[2] = 500;
    goalAmounts[3] = 1000;
    goalAmounts[4] = 500;

    bytes32[] memory tutorialOrders = new bytes32[](5);

    for (uint i; i < 5; i++) {
      tutorialOrders[i] = LibOrder.create(MATERIAL_TYPE.BUG, 2000, goalMaterials[i], goalAmounts[i], true, 0, 0, 0);
    }

    TutorialOrders.set(tutorialOrders);
  }
}
