import { Product } from "../resolver/patches/types"
import { GRAPH_ENTITY_STATE } from "./enums"

type Patches = {
  tank?: boolean
  inputs?: Product[]
  outputs?: Product[]
  productive?: boolean
}

/*
 * State: If the machine/connecting is carrying/producing a product (ACTIVE) or not (IDLE)
 */
type GraphEntityState = {
  state: GRAPH_ENTITY_STATE
  products: {
    materialId: MaterialId
    amount: bigint
  }[]
}

export type Connection = {
  id: string
  sourceMachine: string
  targetMachine: string
  portIndex: {
    source: number
    target: number
  }
  productive: boolean
} & GraphEntityState

export type SimulatedEntity = Entity & Patches
export type SimulatedTank = Tank & Patches
export type SimulatedMachine = Machine & Patches & GraphEntityState

export type SimulatedEntities = {
  [key: string]: SimulatedEntity
}

export type SimulatedMachines = {
  [key: string]: SimulatedMachine
}

export type SimulatedTanks = {
  [key: string]: SimulatedTank
}

export type Attachment = {
  tank: string
  machine: string
  name: "I" | "O" | "none"
}
