import type { GraphConnection } from "../types"
import {
  line,
  curveBasis,
  curveCatmullRom,
  curveBumpX,
  curveBumpY,
  curveCardinal,
  curveMonotoneX,
  curveMonotoneY,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from "d3-shape"

export const catMullRom = line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(curveCatmullRom.alpha(0.6))

export const basis = line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(curveBasis)

export const bumpX = line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(curveBumpX)

export const bumpY = line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(curveBumpY)

export const cardinal = line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(curveCardinal.tension(0.6))

export const monotoneX = line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(curveMonotoneX)

export const monotoneY = line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(curveMonotoneY)

export const step = line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(curveStep)

export const stepBefore = line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(curveStepBefore)

export const stepAfter = line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(curveStepAfter)

export const generators = {
  catMullRom,
  basis,
  bumpX,
  bumpY,
  cardinal,
  monotoneX,
  monotoneY,
  step,
  stepBefore,
  stepAfter,
}

export function generatePoints(
  connection: GraphConnection,
  cellHeight: number,
  cellWidth: number
) {
  if (connection.path.length === 0) return ""

  // Initialize an array to hold the adjusted path points, including the new start and end points
  let adjustedPath = []

  // Calculate the starting point that extends to the left edge of the first cell
  const firstPoint = connection.path[0]
  const extendedStartX = (firstPoint[0] + 0.5) * cellWidth - cellWidth / 2 // Adjust for center, then move to left edge
  const extendedStartY = (firstPoint[1] + 0.5) * cellHeight // Center Y coordinate
  adjustedPath.push({ x: extendedStartX, y: extendedStartY })

  // Add the original path points, adjusted to center of cells
  const centerPoints = connection.path.map(([x, y]) => {
    const centerX = (x + 0.5) * cellWidth // Center X coordinate
    const centerY = (y + 0.5) * cellHeight // Center Y coordinate
    return { x: centerX, y: centerY }
  })
  adjustedPath = adjustedPath.concat(centerPoints)

  // Calculate the ending point that extends to the right edge of the last cell
  const lastPoint = connection.path[connection.path.length - 1]
  const extendedEndX = (lastPoint[0] + 0.5) * cellWidth + cellWidth / 2 // Adjust for center, then move to right edge
  const extendedEndY = (lastPoint[1] + 0.5) * cellHeight // Center Y coordinate
  adjustedPath.push({ x: extendedEndX, y: extendedEndY })

  return adjustedPath
}

export function generateSvgPath(
  connection: GraphConnection,
  cellHeight: number,
  cellWidth: number
): string {
  const adjustedPath = generatePoints(connection, cellHeight, cellWidth)

  // Start the path at the first (extended) point
  let pathData = `M ${adjustedPath[0].x},${adjustedPath[0].y}`

  // Draw lines to each subsequent point, including the new last (extended) point
  adjustedPath.slice(1).forEach(point => {
    pathData += ` L ${point.x},${point.y}`
  })

  return pathData
}

export function getMidpoint(
  connection: GraphConnection,
  cellHeight: number,
  cellWidth: number
): [number, number] {
  const midpointIndex = Math.floor((connection.path.length - 1) / 2)
  const [midGridX, midGridY] = connection.path[midpointIndex]
  const midX = (midGridX + 0.5) * cellWidth
  const midY = (midGridY + 0.5) * cellHeight
  return [midX, midY]
}

export function generateSvgArrow(
  connection: GraphConnection,
  cellHeight: number,
  cellWidth: number
): string {
  if (connection.path.length === 0) return ""

  // Calculate the midpoint index and its coordinates, then scale them
  const midpointIndex = Math.floor((connection.path.length - 1) / 2)
  const [midX, midY] = getMidpoint(connection, cellHeight, cellWidth)
  const [nextGridX, nextGridY] = connection.path[midpointIndex + 1]

  // Scale midpoint and next point coordinates to fit the grid

  const nextX = (nextGridX + 0.5) * cellWidth
  const nextY = (nextGridY + 0.5) * cellHeight

  // Calculate direction from scaled midpoint to next point
  const dx = nextX - midX
  const dy = nextY - midY

  // Calculate the angle for the arrowhead
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  // Define the size of the arrowhead, potentially scaling it
  const arrowSize = Math.min(cellWidth, cellHeight) * 1.3 // Example scaling factor, adjust as needed

  // Calculate the points for the arrowhead polygon, starting from the origin to make rotation easier
  const arrowPoints = [
    [0, 0], // The tip of the arrow at the origin, will be translated to midpoint
    [-arrowSize, -arrowSize / 2],
    [-arrowSize, arrowSize / 2],
  ].map(([x, y]) => {
    // Rotate the points by the calculated angle
    const rotatedX =
      x * Math.cos((angle * Math.PI) / 180) -
      y * Math.sin((angle * Math.PI) / 180)
    const rotatedY =
      x * Math.sin((angle * Math.PI) / 180) +
      y * Math.cos((angle * Math.PI) / 180)
    // Translate the rotated points to the scaled midpoint
    return [rotatedX + midX, rotatedY + midY]
  })

  // Convert arrowPoints to a string format suitable for the 'points' attribute of an SVG polygon
  const arrowData = arrowPoints.map(point => point.join(",")).join(" ")

  return arrowData
}
