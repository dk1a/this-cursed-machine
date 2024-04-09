// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { GameConfig, EntityType, CarriedBy, MaterialType, Order, OrderData, Amount, CurrentOrder, DepotConnection, Tutorial, TutorialLevel, Completed, FixedEntities, FixedEntitiesData, DepotsInPod, EarnedPoints, OutgoingConnections, IncomingConnections } from "../../codegen/index.sol";
import { MACHINE_TYPE, ENTITY_TYPE, MATERIAL_TYPE } from "../../codegen/common.sol";
import { LibUtils, LibOrder, LibToken, LibNetwork, LibReset } from "../../libraries/Libraries.sol";
import { ArrayLib } from "@latticexyz/world-modules/src/modules/utils/ArrayLib.sol";
import { TUTORIAL_LEVELS } from "../../constants.sol";

contract OrderSystem is System {
  /**
   * @notice Create an order
   * @dev Free for admin, charges reward cost for non-admin
   * @param _title Title of the order
   * @param _materialType Material type to produce
   * @param _amount Amount to produce
   * @param _reward Reward for completing the order
   * @param _duration Duration of the order
   * @param _maxPlayers Maximum number of players that can accept the order
   * @return orderEntity Id of the offer entity
   */
  function createOrder(
    string memory _title,
    MATERIAL_TYPE _materialType,
    uint32 _amount,
    uint32 _reward,
    uint32 _duration,
    uint32 _maxPlayers
  ) public returns (bytes32 orderEntity) {
    require(_maxPlayers > 0, "max players must be greater than 0");
    // @todo: limit title length

    // If the caller is not admin, we charge for the reward cost
    if (_msgSender() != GameConfig.getAdminAddress()) {
      uint32 totalRewardCost = _reward * _maxPlayers;
      require(LibToken.getTokenBalance(_msgSender()) > totalRewardCost, "insufficient funds");
      LibToken.transferToken(_world(), totalRewardCost);
    }

    orderEntity = LibOrder.create(
      LibUtils.addressToEntityKey(_msgSender()),
      _title,
      _materialType,
      _amount,
      false, // Not tutorial
      0, // Not tutorial
      _reward,
      _duration,
      _maxPlayers
    );

    return orderEntity;
  }

  /**
   * @notice Cancel an order
   * @dev Restricted to admin
   * @param _orderEntity Id of the order entity
   */
  function cancel(bytes32 _orderEntity) public {
    //  Restrict to admin
    require(_msgSender() == GameConfig.getAdminAddress(), "not allowed");

    Order.deleteRecord(_orderEntity);
    Completed.deleteRecord(_orderEntity);
  }

  /**
   * @notice Accept an order
   * @dev This simply indicates that a user is commiting to an order, we also do some pre wiring of the pods for tutorial levels
   * @param _orderEntity Id of the order entity
   */
  function accept(bytes32 _orderEntity) public {
    bytes32 playerEntity = LibUtils.addressToEntityKey(_msgSender());
    bytes32 podEntity = CarriedBy.get(playerEntity);

    require(EntityType.get(_orderEntity) == ENTITY_TYPE.ORDER, "not order");

    if (Tutorial.get(playerEntity)) {
      require(Tutorial.get(_orderEntity), "not tutorial order");
      uint32 playerTutorialLevel = TutorialLevel.get(playerEntity);
      require(playerTutorialLevel == TutorialLevel.get(_orderEntity), "wrong tutorial level");

      /*
       * For didactic purposes, we wire up the pods for the tutorial levels
       */
      if (playerTutorialLevel == 0 || playerTutorialLevel == 1) {
        FixedEntitiesData memory fixedEntities = FixedEntities.get(podEntity);
        bytes32[] memory depotsInPod = DepotsInPod.get(podEntity);
        // Attach depot 1 to inlet 1
        DepotConnection.set(fixedEntities.inlets[0], depotsInPod[0]);
        DepotConnection.set(depotsInPod[0], fixedEntities.inlets[0]);
        // Attach depot 2 to outlet
        DepotConnection.set(fixedEntities.outlet, depotsInPod[1]);
        DepotConnection.set(depotsInPod[1], fixedEntities.outlet);
        // Connect Inlet 1 to Player
        OutgoingConnections.update(fixedEntities.inlets[0], 0, playerEntity);
        IncomingConnections.update(playerEntity, 0, fixedEntities.inlets[0]);
        // Disconnect Player
        OutgoingConnections.update(playerEntity, 0, bytes32(0));
        OutgoingConnections.update(playerEntity, 1, bytes32(0));
        // Disconnect outlet
        IncomingConnections.update(fixedEntities.outlet, 0, bytes32(0));
        // Resolve
        // LibNetwork.resolve(podEntity);
      } else if (playerTutorialLevel == 2) {
        // Reset pod
        LibReset.reset(podEntity);
      }
    }

    OrderData memory currentOrder = Order.get(_orderEntity);

    require(currentOrder.expirationBlock == 0 || block.number < currentOrder.expirationBlock, "order expired");
    require(!ArrayLib.includes(Completed.get(_orderEntity), playerEntity), "order already completed");

    CurrentOrder.set(playerEntity, _orderEntity);
  }

  /**
   * @notice Unaccept the current order
   */
  function unaccept() public {
    bytes32 playerEntity = LibUtils.addressToEntityKey(_msgSender());
    CurrentOrder.set(playerEntity, bytes32(0));
  }

  /**
   * @notice Ship an order
   * @dev Compares the depot to the current order goals and completes if goals are met
   * @param _depotEntity Id of the depot entity
   */
  function ship(bytes32 _depotEntity) public {
    bytes32 playerEntity = LibUtils.addressToEntityKey(_msgSender());
    bytes32 podEntity = CarriedBy.get(playerEntity);

    require(CarriedBy.get(_depotEntity) == podEntity, "not in pod");
    require(EntityType.get(_depotEntity) == ENTITY_TYPE.DEPOT, "not depot");
    // You can't ship a depot that is connected
    require(DepotConnection.get(_depotEntity) == bytes32(0), "depot connected");

    bytes32 currentOrderId = CurrentOrder.get(playerEntity);
    require(currentOrderId != bytes32(0), "no order");

    OrderData memory currentOrder = Order.get(currentOrderId);

    // maxPlayers == 0 means the order has no limit
    require(
      currentOrder.maxPlayers == 0 || Completed.length(currentOrderId) < currentOrder.maxPlayers,
      "max players reached"
    );

    // expirationBlock == 0 means the order never expires
    require(currentOrder.expirationBlock == 0 || block.number < currentOrder.expirationBlock, "order expired");

    // Check if order goals are met
    require(
      MaterialType.get(_depotEntity) == currentOrder.materialType && Amount.get(_depotEntity) >= currentOrder.amount,
      "order not met"
    );

    // Clear currentOrder
    CurrentOrder.set(playerEntity, bytes32(0));

    // Empty depot
    MaterialType.set(_depotEntity, MATERIAL_TYPE.NONE);
    Amount.set(_depotEntity, 0);

    /*
     * In tutorial
     */

    if (Tutorial.get(playerEntity)) {
      uint32 nextTutorialLevel = TutorialLevel.get(playerEntity) + 1;

      if (nextTutorialLevel < TUTORIAL_LEVELS) {
        // Level up player
        TutorialLevel.set(playerEntity, nextTutorialLevel);
      }

      // Reward player in tokens
      LibToken.send(_msgSender(), currentOrder.reward);
      EarnedPoints.set(playerEntity, EarnedPoints.get(playerEntity) + currentOrder.reward);

      return;
    }

    /*
     * Not in tutorial
     */

    // On order: add player to completed list
    Completed.push(currentOrderId, playerEntity);
    // On player: add order to completed list
    Completed.push(playerEntity, currentOrderId);

    // Reward player in tokens
    LibToken.send(_msgSender(), currentOrder.reward);
    EarnedPoints.set(playerEntity, EarnedPoints.get(playerEntity) + currentOrder.reward);
  }
}
