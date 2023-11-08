// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { System } from "@latticexyz/world/src/System.sol";
import { Level, CarriedBy, MaterialType, Amount, MaterialsInPod, CompletionTimes, LevelStartBlock } from "../codegen/index.sol";
import { MACHINE_TYPE } from "../codegen/common.sol";
import { LibUtils, LibGoal, LibNetwork, LibMaterial } from "../libraries/Libraries.sol";

contract TransferSystem is System {
  /**
   * @notice Transfers, levels up the core entity, and rearranges entities within a new box configuration.
   * @return podEntity The identifier of the newly created box entity.
   * @dev Ensure the proper deletion of the old box in future versions.
   */
  function transfer() public returns (bytes32) {
    bytes32 coreEntity = LibUtils.addressToEntityKey(_msgSender());
    bytes32 podEntity = CarriedBy.get(coreEntity);
    uint32 newLevel = Level.get(coreEntity) + 1;

    // New level needs to be in range 2 to 7
    require(newLevel > 1 && newLevel < 8, "illegal level");

    // Resolve network
    LibNetwork.resolve(coreEntity);

    // Check goals
    require(LibGoal.goalsAreAchived(coreEntity), "goals not achieved");

    // Transfer goal materials to warehouse
    LibGoal.transferToWarehouse(coreEntity);

    // Destroy all output in pod
    bytes32[] memory materialsInPod = MaterialsInPod.get(podEntity);
    MaterialsInPod.set(podEntity, new bytes32[](0));
    for (uint256 i = 0; i < materialsInPod.length; i++) {
      LibMaterial.destroy(materialsInPod[i]);
    }

    // Store completion time
    uint256[] memory currentCompletionTimes = CompletionTimes.get(coreEntity);
    uint256[] memory newCompletionTimes = new uint256[](currentCompletionTimes.length + 1);
    for (uint256 i = 0; i < currentCompletionTimes.length; i++) {
      newCompletionTimes[i] = currentCompletionTimes[i];
    }
    newCompletionTimes[newCompletionTimes.length - 1] = block.number - LevelStartBlock.get(coreEntity);
    CompletionTimes.set(coreEntity, newCompletionTimes);
    LevelStartBlock.set(coreEntity, block.number);

    // Level up core entity
    Level.set(coreEntity, newLevel);

    return podEntity;
  }
}
