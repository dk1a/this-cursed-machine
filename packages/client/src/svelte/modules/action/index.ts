import { MACHINE_TYPE, PORT_INDEX } from "../state/base/enums"
import { addToSequencer } from "./actionSequencer"

export enum WorldFunctions {
  // Progression
  Spawn = "spawn",
  Start = "start",
  // Machines
  BuildMachine = "buildMachine",
  RemoveMachine = "removeMachine",
  Connect = "connect",
  Disconnect = "disconnect",
  // Tanks
  PlugTank = "plugTank",
  UnplugTank = "unplugTank",
  EmptyTank = "emptyTank",
  FillTank = "fillTank",
  ShipTank = "shipTank",
  // Pod
  WipePod = "wipePod",
  // Orders
  AcceptOrder = "acceptOrder",
  UnacceptOrder = "unacceptOrder",
  // Offers
  BuyOffer = "buyOffer",
  // Convenience
  Resolve = "resolve"
}

// --- API --------------------------------------------------------------

/* * * * * * * * * * * * * * * * * * * * * * * *
 * Progression
 * * * * * * * * * * * * * * * * * * * * * * * */

export function spawn(name: string) {
  return addToSequencer(WorldFunctions.Spawn, [name])
}

export function start() {
  return addToSequencer(WorldFunctions.Start, [])
}

/* * * * * * * * * * * * * * * * * * * * * * * *
 * Machines
 * * * * * * * * * * * * * * * * * * * * * * * */

export function buildMachine(machineType: MACHINE_TYPE) {
  return addToSequencer(WorldFunctions.BuildMachine, [machineType])
}

export function removeMachine(machineEntity: string) {
  return addToSequencer(WorldFunctions.RemoveMachine, [machineEntity])
}

export function connect(
  sourceMachine: string,
  targetMachine: string,
  portIndex: PORT_INDEX
) {
  return addToSequencer(WorldFunctions.Connect, [
    sourceMachine,
    targetMachine,
    portIndex,
  ])
}

export function disconnect(sourceMachine: string, portIndex: PORT_INDEX) {
  return addToSequencer(WorldFunctions.Disconnect, [sourceMachine, portIndex])
}

/* * * * * * * * * * * * * * * * * * * * * * * *
 * Tanks
 * * * * * * * * * * * * * * * * * * * * * * * */

export function plugTank(tankEntity: string, targetEntity: string) {
  return addToSequencer(WorldFunctions.PlugTank, [tankEntity, targetEntity])
}

export function unplugTank(tankEntity: string) {
  return addToSequencer(WorldFunctions.UnplugTank, [tankEntity])
}

export function emptyTank(tankEntity: string) {
  return addToSequencer(WorldFunctions.EmptyTank, [tankEntity])
}

export function shipTank(tankEntity: string) {
  return addToSequencer(WorldFunctions.ShipTank, [tankEntity])
}

export function fillTank(tankEntity: string, amount: number, materialId: MaterialId) {
  return addToSequencer(WorldFunctions.FillTank, [tankEntity, amount, materialId])
}

/* * * * * * * * * * * * * * * * * * * * * * * *
 * Pod
 * * * * * * * * * * * * * * * * * * * * * * * */

export function wipePod() {
  return addToSequencer(WorldFunctions.WipePod, [])
}

/* * * * * * * * * * * * * * * * * * * * * * * *
 * Orders
 * * * * * * * * * * * * * * * * * * * * * * * */

export function acceptOrder(orderEntity: string) {
  return addToSequencer(WorldFunctions.AcceptOrder, [orderEntity])
}

export function unacceptOrder() {
  return addToSequencer(WorldFunctions.UnacceptOrder, [])
}

/* * * * * * * * * * * * * * * * * * * * * * * *
 * Offers
 * * * * * * * * * * * * * * * * * * * * * * * */

export function buyOffer(offerEntity: string) {
  return addToSequencer(WorldFunctions.BuyOffer, [offerEntity])
}

/* * * * * * * * * * * * * * * * * * * * * * * *
 * Convenience
 * * * * * * * * * * * * * * * * * * * * * * * */

export function resolve() {
  return addToSequencer(WorldFunctions.Resolve, [])
}