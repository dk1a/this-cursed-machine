// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

import { MaterialId } from "./../../libraries/Libraries.sol";

/**
 * @title IOrderSystem
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IOrderSystem {
  function createOrder(
    MaterialId _materialId,
    uint256 _amount,
    uint256 _reward,
    uint32 _duration,
    uint32 _maxPlayers
  ) external returns (bytes32 orderEntity);

  function cancelOrder(bytes32 _orderEntity) external;

  function acceptOrder(bytes32 _orderEntity) external;

  function unacceptOrder() external;
}
