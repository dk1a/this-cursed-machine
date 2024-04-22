// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

import { MaterialId } from "./../../libraries/Libraries.sol";

/**
 * @title IOfferSystem
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IOfferSystem {
  function createOffer(MaterialId _materialId, uint32 _amount, uint32 _cost) external returns (bytes32 orderEntity);

  function cancelOffer(bytes32 _offerEntity) external;

  function buyOffer(bytes32 _offerEntity) external;
}
