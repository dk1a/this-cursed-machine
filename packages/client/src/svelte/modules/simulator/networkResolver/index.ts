/*
 *  Resolve network
 *
 */

import { get } from "svelte/store"
import { playerBox } from "../../state"
import { localResolved, patches } from ".."
import { blockNumber } from "../../network"
import { MachineType, MaterialType, PortType } from "../../state/enums"
import {
  playerEntityId,
  playerCore,
  machinesInPlayerBox,
  ports,
  connections,
  machines,
} from "../../state"
import { process } from "./machines"
import type { Product, SimulatedEntities } from "../types"
import { deepClone } from "../../utils/misc"

// --- API -----------------------------------------------------------------

export function initStateSimulator() {
  blockNumber.subscribe(async () => {
    // Player is not spawned yet
    if (!get(playerCore)) return

    // Network was resolved onchain
    if (get(playerBox).lastResolved !== get(localResolved)) {
      // console.log('!!!! Network was resolved onchain')
      // Resolve output
      patches.set(resolve(get(playerCore).carriedBy))
      // Update localResolved
      localResolved.set(get(playerBox).lastResolved)
    }

    // Update core energy
    // patches.update(patches => {
    //   if (!patches[get(playerEntityId)]) {
    //     patches[get(playerEntityId)] = {}
    //   }
    //   patches[get(playerEntityId)].energy = updateCoreEnergy(get(playerEntityId));
    //   return patches;
    // })
  })
}

/**
 * Resolves the state of a given box entity.
 * This function simulates a process within a system of machines that interact with each other.
 * It processes the materials through the network of machines until all machines are resolved.
 *
 * @param _boxEntity - Identifier for the box entity to be resolved.
 */
function resolve(_boxEntity: string) {
  // console.log('____ Resolving at block', get(blockNumber));

  let iterationCounter = 0

  // Get all the machines associated with the box entity.
  const machines = get(machinesInPlayerBox)

  // Array to track which nodes (machines) have been resolved.
  const resolvedNodes: string[] = []

  // Array to hold the inputs
  let inputs: Product[] = []

  // Store the products for intermediary state
  let patchOutputs: Product[] = []
  let patchInputs: Product[] = []

  // Loop until all machines are resolved.
  while (resolvedNodes.length < Object.keys(machines).length) {
    // console.log('__ Iteration', iterationCounter)

    // Process each machine.
    Object.entries(machines).forEach(([machineKey, machine]) => {
      // Skip if the machine has already been resolved.
      if (resolvedNodes.includes(machineKey)) return

      // console.log('**********************')
      // console.log('**********************')
      // console.log('** Processing machine_', shortenAddress(machineKey), 'type:', MachineType[machine.machineType])

      // If the machine is an inlet, provide it with bugs as input.
      if (machine.machineType === MachineType.INLET) {
        inputs.push({
          machineId: machineKey,
          materialType: MaterialType.BUG,
          amount: 100,
        })
      }

      // Gather all the inputs for the current machine.
      const currentInputs = inputs.filter(
        input => input.machineId === machineKey
      )

      // Save to patchInputs
      for (let k = 0; k < currentInputs.length; k++) {
        // console.log('&& Input', k);
        // console.log('&& machineId', shortenAddress(currentInputs[k].machineId));
        // console.log('&& materialType', MaterialType[currentInputs[k].materialType]);
        // console.log('&& amount', currentInputs[k].amount);
        // console.log('&&&&&&&&&&')
        patchInputs.push(deepClone(currentInputs[k]))
      }

      // Skip if the machine has no inputs !!! and is not a core
      // !!! (Energy level of cores tick down even if not connected...)
      // && machine.machineType !== MachineType.CORE
      if (currentInputs.length === 0) return

      // Process the machine's inputs to produce outputs.
      const currentOutputs = process(machine.machineType, currentInputs)

      // Save to patchInputs
      for (let k = 0; k < currentOutputs.length; k++) {
        // console.log('%% Output', k);
        // console.log('%% machineId', shortenAddress(currentOutputs[k].machineId));
        // console.log('%% materialType', MaterialType[currentOutputs[k].materialType]);
        // console.log('%% amount', currentOutputs[k].amount);
        // console.log('%%%%%%%%%%')
        patchOutputs.push(deepClone(currentOutputs[k]))
      }

      // Mark the machine as resolved.
      resolvedNodes.push(machineKey)

      // Find the machine's output ports.
      let machinePorts: string[] = []
      Object.entries(get(ports)).forEach(([portKey, port]) => {
        // console.log('=1', port.carriedBy)
        // console.log('=2', machineKey)
        // console.log('port.portType === PortType.OUTPUT', port.portType === PortType.OUTPUT)
        // console.log('port.carriedBy == machineKey', port.carriedBy == machineKey)
        if (port.portType == PortType.OUTPUT && port.carriedBy == machineKey) {
          machinePorts.push(portKey)
        }
      })

      // console.log("machinePorts", machinePorts)

      if (machinePorts.length === 0) return

      // Distribute the machine's outputs to the connected machines.
      for (let k = 0; k < machinePorts.length; k++) {
        // console.log("machinePorts[k]", machinePorts[k])

        const outgoingConnection = Object.values(get(connections)).find(
          entity => entity.sourcePort === machinePorts[k]
        ) as Connection

        // console.log("outgoingConnection", outgoingConnection)

        if (!outgoingConnection) continue

        const inputPort = outgoingConnection.targetPort
        const targetEntity = get(ports)[inputPort].carriedBy

        if (currentOutputs[k]?.materialType !== MaterialType.NONE) {
          const output = currentOutputs[k]
          output.machineId = targetEntity
          inputs.push(output)
        }
      }

      // console.log('**********************')
      // console.log('**********************')
    })

    // Increment the counter.
    iterationCounter++
    // Break out of the loop if it seems like an infinite loop is occurring.
    if (iterationCounter === Object.values(machines).length * 2) break
  }

  let patches = {} as SimulatedEntities

  // console.log('patchOutputs', patchOutputs);

  // Aggregate and organize patch outputs.
  for (let i = 0; i < patchOutputs.length; i++) {
    if (!patches[patchOutputs[i].machineId]) {
      patches[patchOutputs[i].machineId] = {
        outputs: [],
      }
    }

    if (!patches[patchOutputs[i].machineId].outputs) {
      patches[patchOutputs[i].machineId].outputs = []
    }

    patches[patchOutputs[i].machineId].outputs.push(patchOutputs[i])
  }

  // console.log('patchInputs', patchInputs);

  // Aggregate and organize patch inputs.
  for (let i = 0; i < patchInputs.length; i++) {
    if (!patches[patchInputs[i].machineId]) {
      patches[patchInputs[i].machineId] = {
        inputs: [],
      }
    }

    if (!patches[patchInputs[i].machineId].inputs) {
      patches[patchInputs[i].machineId].inputs = []
    }

    patches[patchInputs[i].machineId].inputs.push(patchInputs[i])
  }

  return patches
}

// function updateCoreEnergy(_coreEntity: string) {
//   return coreIsConnectedToInlet(_coreEntity) ? 1 : -1;
// }

export function coreIsConnectedToInlet(_coreEntity: string) {
  // *** 1. Get all input ports on the core
  const inputPortsOnCores = Object.fromEntries(
    Object.entries(get(ports)).filter(
      ([_, port]) =>
        port.carriedBy === _coreEntity && port.portType === PortType.INPUT
    )
  )
  // DEBUG
  console.log("inputPortsOnCores", inputPortsOnCores)
  console.log("Object.keys(inputPortsOnCores)", Object.keys(inputPortsOnCores))
  console.log("get(connections)", get(connections))

  // Abort early if no input ports on core
  if (Object.keys(inputPortsOnCores).length === 0) return false

  // *** 2. Get connections going to input cores on core
  const connectionsToInputPortsOnCores = Object.fromEntries(
    Object.entries(get(connections)).filter(
      ([_, connection]) =>
        connection.targetPort === Object.keys(inputPortsOnCores)[0]
    )
  )

  // DEBUG
  console.log("connectionsToInputPortsOnCores", connectionsToInputPortsOnCores)

  // Abort early if no connections to input ports on core
  if (Object.keys(connectionsToInputPortsOnCores).length === 0) return false

  // 3. Get output ports at end of connections
  const outputPortsAtEndOfConnections =
    get(ports)[Object.values(connectionsToInputPortsOnCores)[0].targetPort]

  // DEBUG
  console.log("outputPortsAtEndOfConnections", outputPortsAtEndOfConnections)

  // 4. Check if machine at end of connection is an inlet
  if (
    get(machines)[outputPortsAtEndOfConnections.carriedBy].machineType !==
    MachineType.INLET
  )
    return false

  // Core is connected
  return true
}
