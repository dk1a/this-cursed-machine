import { writable, get } from "svelte/store"
import { originAddress } from "../../state"

const img = new Image()

const placeholder = writable(img)

/**
 * Initialize UI to make dragging seamless
 */
export function initUI () {
  // Add an empty image when dragged to prevent image missing icon
  const img = new Image()

  img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

  img.addEventListener('load', () => {
    placeholder.set(img)
  })
}

/**
 * Thin wrapper for drag events
 */
export function onDragStart (e, address: string, passive = false) {
  console.log('on drag start')
  if (!passive) {
    originAddress.set(address)
  }
  e.dataTransfer.setData("text/plain", e.target.classList)
  e.dataTransfer.setDragImage(img, 0, 0)
}