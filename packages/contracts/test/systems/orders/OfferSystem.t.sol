// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { BaseTest } from "../../BaseTest.sol";
import "../../../src/codegen/index.sol";
import "../../../src/libraries/Libraries.sol";
import { MACHINE_TYPE, PORT_INDEX } from "../../../src/codegen/common.sol";
import { FLOW_RATE, ONE_MINUTE, ONE_HOUR, ONE_TOKEN_UNIT } from "../../../src/constants.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { _balancesTableId } from "@latticexyz/world-modules/src/modules/erc20-puppet/utils.sol";
import { Balances } from "@latticexyz/world-modules/src/modules/tokens/tables/Balances.sol";
import { Puppet } from "@latticexyz/world-modules/src/modules/puppet/Puppet.sol";

contract OfferSystemTest is BaseTest {
  using WorldResourceIdInstance for ResourceId;

  bytes32 playerEntity;
  bytes32 podEntity;
  bytes32[] inletEntities;
  bytes32 outletEntity;
  bytes32[] tanksInPod;
  bytes32[] tutorialLevels;
  FixedEntitiesData fixedEntities;

  function setUp() public override {
    super.setUp();
    vm.startPrank(alice);

    // Spawn player
    playerEntity = world.spawn("alice");
    world.start();

    podEntity = CarriedBy.get(playerEntity);

    inletEntities = FixedEntities.get(podEntity).inlets;
    outletEntity = FixedEntities.get(podEntity).outlet;

    tanksInPod = TanksInPod.get(podEntity);

    fixedEntities = FixedEntities.get(podEntity);

    vm.stopPrank();
  }

  function testCreateOffer() public {
    setUp();

    prankAdmin();

    // Create order
    startGasReport("Create offer");
    bytes32 offerEntity = world.createOffer(PublicMaterials.BLOOD, 10000, 100);
    endGasReport();

    OfferData memory offerData = Offer.get(offerEntity);

    assertEq(offerData.materialId.unwrap(), PublicMaterials.BLOOD.unwrap());
    assertEq(offerData.amount, 10000);
    assertEq(offerData.cost, 100);

    vm.stopPrank();
  }

  function testRevertCreateOfferNotAllowed() public {
    setUp();

    vm.startPrank(alice);

    // Create order
    vm.expectRevert("not allowed");
    world.createOffer(PublicMaterials.BLOOD, 10000, 100);

    vm.stopPrank();
  }

  // function testBuyInTutorial() public {
  //   setUp();

  //   prankAdmin();
  //   bytes32 offerEntity = world.createOffer(PublicMaterials.BUG, 10000, 100);
  //   vm.stopPrank();

  //   vm.startPrank(alice);

  //   startGasReport("Buy");
  //   world.buyOffer(offerEntity);
  //   endGasReport();

  //   vm.stopPrank();

  //   assertEq(PublicMaterials.BUG.getTokenBalance(alice), 0);
  //   assertEq(ContainedMaterial.get(tanksInPod[0]).unwrap(), PublicMaterials.BUG.unwrap());
  //   assertEq(Amount.get(tanksInPod[0]), 20000);
  // }

  function testBuyInMainGame() public {
    setUp();

    prankAdmin();
    bytes32 offerEntity = world.createOffer(PublicMaterials.BLOOD, 10000, 100);
    vm.stopPrank();

    vm.startPrank(alice);

    world.graduate();

    world.fillTank(tanksInPod[0], 10000, PublicMaterials.BUG);

    world.buyOffer(offerEntity);

    vm.stopPrank();

    assertEq(PublicMaterials.BUG.getTokenBalance(alice), 9900 * ONE_TOKEN_UNIT);
    assertEq(ContainedMaterial.get(tanksInPod[1]).unwrap(), PublicMaterials.BLOOD.unwrap());
    assertEq(Amount.get(tanksInPod[1]), 10000);
  }
}
