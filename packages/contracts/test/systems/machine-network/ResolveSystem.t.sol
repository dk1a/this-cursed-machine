// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { BaseTest } from "../../BaseTest.sol";
import "../../../src/codegen/index.sol";
import "../../../src/libraries/Libraries.sol";
import { MACHINE_TYPE, ENTITY_TYPE, MATERIAL_TYPE, PORT_INDEX } from "../../../src/codegen/common.sol";

contract ResolveSystemTest is BaseTest {
  bytes32 playerEntity;
  bytes32 podEntity;
  bytes32[] inletEntities;
  bytes32 outletEntity;
  bytes32[] storageInPod;

  function setUp() public override {
    super.setUp();
    vm.startPrank(alice);

    // Spawn player
    playerEntity = world.spawn();
    world.start();

    podEntity = CarriedBy.get(playerEntity);

    inletEntities = FixedEntities.get(podEntity).inlets;
    outletEntity = FixedEntities.get(podEntity).outlet;

    storageInPod = StorageInPod.get(podEntity);

    vm.stopPrank();
  }

  function testResolve() public {
    setUp();

    vm.startPrank(alice);

    // Connect storage 0 to inlet
    world.connectStorage(storageInPod[0], MACHINE_TYPE.INLET);

    // Connect storage 1 to outlet
    world.connectStorage(storageInPod[1], MACHINE_TYPE.OUTLET);

    // Connect inlet to outlet
    world.connect(inletEntities[0], outletEntity, PORT_INDEX.FIRST);

    // Wait 5 blocks
    vm.roll(block.number + 3);

    // Resolve
    world.resolve();

    vm.stopPrank();

    assertEq(uint32(MaterialType.get(storageInPod[0])), uint32(MATERIAL_TYPE.BUG));

    // 3 blocks passed
    // Inlet material spent => 3 * 100 = 300
    // Outlet material gained => 3 * 100 = 300
    assertEq(Amount.get(storageInPod[0]), 700); // 1000 - 300
    assertEq(Amount.get(storageInPod[1]), 300);
  }

  function testMachineProcessingLoss() public {
    setUp();

    vm.startPrank(alice);

    // Connect storage 0 to inlet
    world.connectStorage(storageInPod[0], MACHINE_TYPE.INLET);

    // Connect storage 0 to outlet
    world.connectStorage(storageInPod[1], MACHINE_TYPE.OUTLET);

    // Connect inlet to player
    world.connect(inletEntities[0], playerEntity, PORT_INDEX.FIRST);

    // Connect player to outlet
    world.connect(playerEntity, outletEntity, PORT_INDEX.FIRST);

    // Wait 5 blocks
    vm.roll(block.number + 3);

    // Resolve
    world.resolve();

    vm.stopPrank();

    assertEq(uint32(MaterialType.get(storageInPod[1])), uint32(MATERIAL_TYPE.PISS));

    // 3 blocks passed
    // Inlet material spent => 3 * 100 = 300
    // Outlet material gained => 3 * 50 = 150
    assertEq(Amount.get(storageInPod[0]), 700); // 1000 - 300
    assertEq(Amount.get(storageInPod[1]), 150);
  }

  function testDoubleMachineProcessingLoss() public {
    setUp();

    vm.startPrank(alice);

    // Connect storage 0 to inlet
    world.connectStorage(storageInPod[0], MACHINE_TYPE.INLET);

    // Connect storage 1 to outlet
    world.connectStorage(storageInPod[1], MACHINE_TYPE.OUTLET);

    // Connect inlet to player
    world.connect(inletEntities[0], playerEntity, PORT_INDEX.FIRST);

    // Build splitter
    bytes32 splitterEntity = world.build(MACHINE_TYPE.SPLITTER);

    // Connect player to splitter
    world.connect(playerEntity, splitterEntity, PORT_INDEX.FIRST);

    // Connect splitter to outlet
    world.connect(splitterEntity, outletEntity, PORT_INDEX.FIRST);

    // Wait 5 blocks
    vm.roll(block.number + 3);

    // Resolve
    world.resolve();

    vm.stopPrank();

    assertEq(uint32(MaterialType.get(storageInPod[1])), uint32(MATERIAL_TYPE.PISS));

    // 3 blocks passed
    // Inlet material spent => 3 * 100 = 300
    // Outlet material gained => 3 * 25 = 75
    assertEq(Amount.get(storageInPod[1]), 75);
    assertEq(Amount.get(storageInPod[0]), 700); // 1000 - 300
  }

  function testCapAtInletMaterialAmount() public {
    setUp();

    vm.startPrank(alice);

    // Connect storage 0 to inlet
    world.connectStorage(storageInPod[0], MACHINE_TYPE.INLET);

    // Connect storage 1 to outlet
    world.connectStorage(storageInPod[1], MACHINE_TYPE.OUTLET);

    // Connect inlet to player
    world.connect(inletEntities[0], playerEntity, PORT_INDEX.FIRST);

    // Connect player to outlet
    world.connect(playerEntity, outletEntity, PORT_INDEX.FIRST);

    // Wait 50 blocks
    vm.roll(block.number + 50);

    // Resolve
    world.resolve();

    vm.stopPrank();

    // 50 blocks passed
    assertEq(Amount.get(storageInPod[0]), 0); // 1000 - 1000
    assertEq(uint32(MaterialType.get(storageInPod[0])), uint32(MATERIAL_TYPE.NONE));
    assertEq(Amount.get(storageInPod[1]), 500); // 500
    assertEq(uint32(MaterialType.get(storageInPod[1])), uint32(MATERIAL_TYPE.PISS));
  }

  function testMakeCSXIndustrialGrease() public {
    setUp();

    vm.startPrank(alice);

    assertEq(Amount.get(storageInPod[0]), 1000);
    assertEq(uint32(MaterialType.get(storageInPod[0])), uint32(MATERIAL_TYPE.BUG));

    // Connect storage 0 to inlet
    world.connectStorage(storageInPod[0], MACHINE_TYPE.INLET);

    // Connect storage 1 to outlet
    world.connectStorage(storageInPod[1], MACHINE_TYPE.OUTLET);

    // Build boiler
    bytes32 boilerEntity = world.build(MACHINE_TYPE.BOILER);

    // Connect inlet to boiler
    world.connect(inletEntities[0], boilerEntity, PORT_INDEX.FIRST);

    // Connect boiler to outlet
    world.connect(boilerEntity, outletEntity, PORT_INDEX.FIRST);

    // Wait 10 blocks
    vm.roll(block.number + 10);

    // Resolve
    world.resolve();

    vm.stopPrank();

    // Inlet material spent => 10 * 100 = 1000
    assertEq(Amount.get(storageInPod[0]), 0); // 1000 - 300
    assertEq(uint32(MaterialType.get(storageInPod[0])), uint32(MATERIAL_TYPE.NONE));
    // Outlet material gained => 10 * 100 = 500
    assertEq(Amount.get(storageInPod[1]), 1000);
    assertEq(uint32(MaterialType.get(storageInPod[1])), uint32(MATERIAL_TYPE.CSX_INDUSTRIAL_GREASE));
  }

  function testMakeNestlePureLifeBottledWatter() public {
    setUp();

    vm.startPrank(alice);

    assertEq(Amount.get(storageInPod[0]), 1000);
    assertEq(uint32(MaterialType.get(storageInPod[0])), uint32(MATERIAL_TYPE.BUG));

    // Connect storage 0 to inlet
    world.connectStorage(storageInPod[0], MACHINE_TYPE.INLET);

    // Connect storage 1 to outlet
    world.connectStorage(storageInPod[1], MACHINE_TYPE.OUTLET);

    // Connect inlet to player
    world.connect(inletEntities[0], playerEntity, PORT_INDEX.FIRST);

    // Build boiler
    bytes32 boilerEntity = world.build(MACHINE_TYPE.BOILER);

    // Connect player (piss) to boiler
    world.connect(playerEntity, boilerEntity, PORT_INDEX.FIRST);

    // Connect boiler to outlet
    world.connect(boilerEntity, outletEntity, PORT_INDEX.FIRST);

    // Wait 10 blocks
    vm.roll(block.number + 10);

    // Resolve
    world.resolve();

    vm.stopPrank();

    // Inlet material spent => 10 * 100 = 1000
    assertEq(Amount.get(storageInPod[0]), 0); // 1000 - 300
    assertEq(uint32(MaterialType.get(storageInPod[0])), uint32(MATERIAL_TYPE.NONE));
    // Outlet material gained => 10 * 50 = 500
    assertEq(Amount.get(storageInPod[1]), 500);
    assertEq(uint32(MaterialType.get(storageInPod[1])), uint32(MATERIAL_TYPE.NESTLE_PURE_LIFE_BOTTLED_WATER));
  }

  // function testMakeAesopOrganicHandSoap() public {
  //   setUp();

  //   vm.startPrank(alice);

  //   assertEq(Amount.get(storageInPod[0]), 1000);
  //   assertEq(uint32(MaterialType.get(storageInPod[0])), uint32(MATERIAL_TYPE.BUG));

  //   // Connect storage 0 to inlet
  //   world.connectStorage(storageInPod[0], MACHINE_TYPE.INLET);

  //   // Connect storage 1 to outlet
  //   world.connectStorage(storageInPod[1], MACHINE_TYPE.OUTLET);

  //   // ...

  //   // Connect inlet to player
  //   world.connect(inletEntities[0], playerEntity, PORT_INDEX.FIRST);

  //   // Build mixer
  //   bytes32 mixerEntity = world.build(MACHINE_TYPE.MIXER);

  //   // Connect player (piss) to mixer
  //   world.connect(playerEntity, mixerEntity, PORT_INDEX.FIRST);

  //   // Connect player (blood) to mixer
  //   world.connect(playerEntity, mixerEntity, PORT_INDEX.SECOND);

  //   // Connect mixer to outlet
  //   world.connect(mixerEntity, outletEntity, PORT_INDEX.FIRST);

  //   // Wait 10 blocks
  //   vm.roll(block.number + 10);

  //   // Resolve
  //   world.resolve();

  //   vm.stopPrank();

  //   // Inlet material spent => 10 * 100 = 1000
  //   assertEq(Amount.get(storageInPod[0]), 0); // 1000 - 300
  //   assertEq(uint32(MaterialType.get(storageInPod[0])), uint32(MATERIAL_TYPE.NONE));
  //   // Outlet material gained => 10 * 50 = 500
  //   assertEq(Amount.get(storageInPod[1]), 500);
  //   assertEq(uint32(MaterialType.get(storageInPod[1])), uint32(MATERIAL_TYPE.CAFFEINE_SLUSHY));
  // }
}