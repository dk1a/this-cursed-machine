// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;
import { BaseTest } from "../../BaseTest.sol";
import "../../../src/codegen/index.sol";
import "../../../src/libraries/Libraries.sol";
import { ENTITY_TYPE, MACHINE_TYPE, MATERIAL_TYPE } from "../../../src/codegen/common.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { _balancesTableId } from "@latticexyz/world-modules/src/modules/erc20-puppet/utils.sol";
import { Balances } from "@latticexyz/world-modules/src/modules/tokens/tables/Balances.sol";
import { Puppet } from "@latticexyz/world-modules/src/modules/puppet/Puppet.sol";
import { ONE_TOKEN_UNIT } from "../../../src/constants.sol";

contract DevSystemTest is BaseTest {
  using WorldResourceIdInstance for ResourceId;

  function testReward() public {
    setUp();

    vm.startPrank(alice);
    world.reward();
    vm.stopPrank();

    assertEq(PublicMaterials.BUG.getTokenBalance(worldAddress), 0);
    assertEq(PublicMaterials.BUG.getTokenBalance(alice), 1000 * ONE_TOKEN_UNIT);
  }

  function testCharge() public {
    setUp();

    vm.startPrank(alice);
    world.reward();

    assertEq(PublicMaterials.BUG.getTokenBalance(worldAddress), 0);
    assertEq(PublicMaterials.BUG.getTokenBalance(alice), 1000 * ONE_TOKEN_UNIT);

    world.charge();

    assertEq(PublicMaterials.BUG.getTokenBalance(worldAddress), 100 * ONE_TOKEN_UNIT);
    assertEq(PublicMaterials.BUG.getTokenBalance(alice), 900 * ONE_TOKEN_UNIT);

    vm.stopPrank();
  }

  function testGraduate() public {
    setUp();

    vm.startPrank(alice);
    world.graduate();

    assertEq(PublicMaterials.BUG.getTokenBalance(worldAddress), 0);
    assertEq(PublicMaterials.BUG.getTokenBalance(alice), 10000 * ONE_TOKEN_UNIT);

    vm.stopPrank();
  }

  function testRevertInsufficientBalance() public {
    setUp();

    vm.startPrank(alice);

    vm.expectRevert("insufficient balance");
    world.charge();

    vm.stopPrank();
  }
}