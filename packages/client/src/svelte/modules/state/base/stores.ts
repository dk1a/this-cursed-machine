/*
 *  Central store for all entities in the game.
 *
 */
import { ENTITY_TYPE, MACHINE_TYPE } from "./enums"
import { filterByEntitytype, filterByMachinetype, filterByCarriedBy, getRecipes } from "./utils"
import { writable, derived } from "svelte/store"
import { network } from "../../network"

export const GAME_CONFIG_ID = "0x"

// * * * * * * * * * * * * * * * * *
// DEFAULT ENTITY TYPES
// * * * * * * * * * * * * * * * * *

/**
 * Mirror of the full on chain state.
 * Only ever written to via the update systems in module/ssystems
 */
export const entities = writable({} as Entities)

// * * * * * * * * * * * * * * * * *
// GAME CONFIG ENTITIES
// * * * * * * * * * * * * * * * * *

export const gameConfig = derived(entities, $entities => $entities[GAME_CONFIG_ID].gameconfig as GameConfig)
export const recipes = derived(entities, $entities => getRecipes($entities))

// * * * * * * * * * * * * * * * * *
// PLAYER STORES
// * * * * * * * * * * * * * * * * *

export const playerAddress = derived(network, $network => $network.walletClient?.account.address || "0x0" as string)
export const playerId = derived(network, $network => $network.playerEntity || "0x0" as string)
export const player = derived([entities, playerId], ([$entities, $playerId]) => $entities[$playerId] as Player)
export const playerPod = derived(
  [entities, player],
  ([$entities, $player]) => $player?.carriedBy ? $entities[$player.carriedBy] as Pod : {} as Pod
)

// * * * * * * * * * * * * * * * * *
// GAME PLAY ENTITIES
// * * * * * * * * * * * * * * * * *

// Filter by player pod
export const machines = derived([entities, player],
  ([$entities, $player]) => filterByEntitytype(filterByCarriedBy($entities, $player?.carriedBy ?? ""), ENTITY_TYPE.MACHINE) as Machines)
export const depots = derived([entities, player],
  ([$entities, $player]) => filterByEntitytype(filterByCarriedBy($entities, $player?.carriedBy ?? ""), ENTITY_TYPE.DEPOT) as Depots)

export const players = derived(entities, $entities => filterByMachinetype($entities, MACHINE_TYPE.PLAYER) as Players)
export const orders = derived(entities, $entities => filterByEntitytype($entities, ENTITY_TYPE.ORDER) as Orders)

// * * * * * * * * * * * * * * * * *
// POD FIXTURES
// * * * * * * * * * * * * * * * * *

export const outlet = derived([machines, playerPod], ([$machines, $playerPod]) => {
  let outlet = {} as Machines
  const outletId = $playerPod?.fixedEntities?.outlet
  outlet[outletId] = $machines[outletId]
  return outlet
})

export const inlets = derived([machines, playerPod], ([$machines, $playerPod]) => {
  let inlets: Machines = {}
  $playerPod?.fixedEntities?.inlets.forEach(inlet => {
    inlets[inlet] = $machines[inlet]
  })
  return inlets
})