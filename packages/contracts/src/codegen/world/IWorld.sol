// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { IDevSystem } from "./IDevSystem.sol";
import { IBuildSystem } from "./IBuildSystem.sol";
import { IConnectSystem } from "./IConnectSystem.sol";
import { IDestroySystem } from "./IDestroySystem.sol";
import { IDisconnectSystem } from "./IDisconnectSystem.sol";
import { IResetSystem } from "./IResetSystem.sol";
import { IResolveSystem } from "./IResolveSystem.sol";
import { IDepotSystem } from "./IDepotSystem.sol";
import { IOfferSystem } from "./IOfferSystem.sol";
import { IOrderSystem } from "./IOrderSystem.sol";
import { IEscapeSystem } from "./IEscapeSystem.sol";
import { INameSystem } from "./INameSystem.sol";
import { IRewardSystem } from "./IRewardSystem.sol";
import { ISpawnSystem } from "./ISpawnSystem.sol";
import { IStartSystem } from "./IStartSystem.sol";

/**
 * @title IWorld
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface integrates all systems and associated function selectors
 * that are dynamically registered in the World during deployment.
 * @dev This is an autogenerated file; do not edit manually.
 */
interface IWorld is
  IBaseWorld,
  IDevSystem,
  IBuildSystem,
  IConnectSystem,
  IDestroySystem,
  IDisconnectSystem,
  IResetSystem,
  IResolveSystem,
  IDepotSystem,
  IOfferSystem,
  IOrderSystem,
  IEscapeSystem,
  INameSystem,
  IRewardSystem,
  ISpawnSystem,
  IStartSystem
{}
