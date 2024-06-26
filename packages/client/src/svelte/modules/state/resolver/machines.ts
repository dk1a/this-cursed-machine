import { keccak256 } from "viem"
import { MACHINE_TYPE } from "../base/enums"
import { MaterialIdNone } from "../base/constants"
import type { Product } from "./patches/types"
import { deepClone, getMaterialCombinationId } from "../../utils"

const EMPTY_PRODUCT: Product = {
  machineId: "",
  materialId: MaterialIdNone,
  amount: BigInt(0),
  inletActive: [false, false],
}

export function process(
  machineType: MACHINE_TYPE,
  inputs: Product[],
  recipes: Recipe[]
): Product[] {
  if (inputs.length === 0) return [EMPTY_PRODUCT]
  if (machineType === MACHINE_TYPE.PLAYER) {
    return defaultMachine(recipes, machineType, inputs)
  } else if (machineType === MACHINE_TYPE.SPLITTER) {
    return splitter(inputs)
  } else if (machineType === MACHINE_TYPE.MIXER) {
    return mixer(recipes, inputs)
  } else if (machineType >= MACHINE_TYPE.DRYER) {
    return defaultMachine(recipes, machineType, inputs)
  }
  // Default (MACHINE_TYPE.NONE, MACHINE_TYPE.INLET and MACHINE_TYPE.OUTLET)
  return deepClone(inputs)
}

/**
 * Splits the first product from the input array into two products with half the amount.
 * If the input array is empty, it returns an array of two empty products.
 *
 * @param {Product[]} inputs - An array of products, where each product has properties: machineId, materialId, and amount.
 * @returns {Product[]} An array containing two products with the same machineId and materialId as the first product from the input array, but with half the amount.
 */
function splitter(inputs: Product[]): Product[] {
  const outputs: Product[] = [EMPTY_PRODUCT, EMPTY_PRODUCT] // Initializing with two distinct empty objects

  const input = inputs[0]

  if (!input) return outputs

  const halfAmount = input.amount / BigInt(2)

  outputs[0] = {
    machineId: input.machineId,
    materialId: input.materialId,
    amount: halfAmount,
    inletActive: input.inletActive,
  }

  outputs[1] = {
    machineId: input.machineId,
    materialId: input.materialId,
    amount: halfAmount,
    inletActive: input.inletActive,
  }

  return outputs
}

/**
 * Processes the input products using a mixer machine to generate a combined product.
 *
 * @notice The function checks a list of predefined recipes to determine the output product's material type based on the material types of the input products. If a matching recipe is found, the output product is created using the machine ID of the first input product and the specified amount. If no matching recipe is found, the output material type is set to `MaterialIdNone`.
 * @param {Product[]} inputs - An array of input products to be processed by the mixer. The array should contain exactly two products for a successful mixing process.
 * @returns {Product[]} An array containing the processed product. If the input does not meet the requirements or no matching recipe is found, it returns an array with an empty product.
 */
function mixer(recipes: Recipe[], inputs: Product[]): Product[] {
  const outputs: Product[] = [EMPTY_PRODUCT, EMPTY_PRODUCT] // Initializing with two distinct empty objects

  if (inputs.length !== 2) return outputs

  const outputMaterials = findRecipe(
    recipes,
    MACHINE_TYPE.MIXER,
    getMaterialCombinationId(
      inputs[0].materialId,
      inputs[1].materialId
    )
  )

  const lowestAmountProduct = getLowestAmountProduct(inputs[0], inputs[1])

  const combinedInletActive = [
    inputs[0].inletActive[0] || inputs[1].inletActive[0],
    inputs[0].inletActive[1] || inputs[1].inletActive[1],
  ]

  outputs[0] = {
    machineId: inputs[0].machineId,
    materialId: outputMaterials[0],
    amount: lowestAmountProduct.amount,
    inletActive: combinedInletActive,
  }

  return outputs
}

/**
 * Processes the input products using a specified simple machine to generate an output product.
 *
 * @notice The function checks a list of predefined recipes to determine the output product's material type based on the material type of the input product and the specified machine type. If a matching recipe is found, the output product is created using the machine ID of the input product and its amount. If no matching recipe is found, the output material type is set to `MaterialIdNone`.
 * @param {MACHINE_TYPE} machineType - The type of simple machine used for processing.
 * @param {Product[]} inputs - An array of input products to be processed. The function primarily checks the first product in the array.
 * @returns {Product[]} An array containing the processed product. If the input does not meet the requirements or no matching recipe is found, it returns an array with an empty product.
 */
function defaultMachine(
  recipes: Recipe[],
  machineType: MACHINE_TYPE,
  inputs: Product[]
): Product[] {
  const outputs: Product[] = [EMPTY_PRODUCT, EMPTY_PRODUCT] // Initializing with two distinct empty objects

  const input = inputs[0]

  if (!input) return outputs

  const outputMaterials = findRecipe(
    recipes,
    machineType,
    keccak256(input.materialId)
  )

  if (outputMaterials[1] === MaterialIdNone) {
    // One output
    outputs[0] = {
      machineId: input.machineId,
      materialId: outputMaterials[0],
      amount: input.amount,
      inletActive: input.inletActive,
    }

    return outputs
  } else {
    // Two outputs
    outputs[0] = {
      machineId: input.machineId,
      materialId: outputMaterials[0],
      amount: input.amount / BigInt(2),
      inletActive: input.inletActive,
    }

    outputs[1] = {
      machineId: input.machineId,
      materialId: outputMaterials[1],
      amount: input.amount / BigInt(2),
      inletActive: input.inletActive,
    }

    return outputs
  }
}

function getLowestAmountProduct(A: Product, B: Product): Product {
  return A.amount < B.amount ? A : B
}

function findRecipe(
  recipes: Recipe[],
  machineType: MACHINE_TYPE,
  input: string
): MaterialId[] {
  return (
    recipes.find(
      recipe => recipe.machineType === machineType && recipe.input === input
    )?.outputs || [MaterialIdNone, MaterialIdNone]
  )
}
