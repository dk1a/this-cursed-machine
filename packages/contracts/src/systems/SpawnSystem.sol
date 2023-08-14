// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;
import { System } from "@latticexyz/world/src/System.sol";
import { Name, ReadyBlock, ClaimBlock, CreationBlock, Active, Width, Height, Level, MinCores, MaxCores, EntityType, Position, PositionData, CarriedBy, GameConfig, GameConfigData } from "../codegen/Tables.sol";
import { ENTITY_TYPE } from "../codegen/Types.sol";
import { LibUtils, LibBox, LibCore } from "../libraries/Libraries.sol";

contract SpawnSystem is System {
  function spawn(string memory _name) public returns (bytes32) {
    GameConfigData memory gameConfig = GameConfig.get();
    bytes32 coreEntity = LibUtils.addressToEntityKey(_msgSender());
    // TODO: check if already spawned

    // Create box entity
    bytes32 boxEntity = LibBox.create(0, 4, 4, 1, 1, true);

    // Create core entity
    LibCore.spawn(coreEntity, 0, _name);

    // Place in box
    CarriedBy.set(coreEntity, boxEntity);
    Position.set(coreEntity, PositionData(2, 1));

    // TODO: create ports on core entity

    return boxEntity;
  }
}
