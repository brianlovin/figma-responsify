import deviceSizes from './sizes'
import { createAndPlace } from './createAndPlace'
const { command, currentPage, closePlugin } = figma
const { selection } = currentPage

const all = [...Object.keys(deviceSizes).map(key => deviceSizes[key])]
const devices = command === 'all'
  // flatten all devices to a single array
  ? [].concat.apply([], all)
  : deviceSizes[command] 

function hasValidSelection(nodes) {
  const oneSelected = nodes.length === 1
  if (!oneSelected) return false
  
  const frameTypes = ["FRAME", "COMPONENT", "INSTANCE"]
  const isFrame = frameTypes.indexOf(nodes[0].type) >= 0
  return isFrame
}

function main(nodes) {
  if (!hasValidSelection(selection)) {
    return closePlugin('Select a single frame to test responsive sizes')
  }

  // the frame to clone
  const selectedNode = nodes[0]

  function generateContainerFrames() {
    let frames: FrameNode[] = []
    
    for (let [index, device] of devices.entries()) {
      frames.push(createAndPlace({ device, devices, index, selectedNode }))
    }
    
    return frames
  }

  function insertSelectionAndResizeIntoContainerFrames(containerFrames) {
    for (let container of containerFrames) {
      const clone = selectedNode.clone()
      clone.x = 0
      clone.y = 0
      clone.resize(container.width, container.height)
      container.appendChild(clone)
    }
  }

  const containerFrames = generateContainerFrames()
  
  // if the selected node is a frame, we have to manually append it into
  // the newly generated containers. if the selected node is a component,
  // this is not needed because the instances don't necessarily need
  // to be housed in a parent frame.
  if (selectedNode.type === "FRAME") {
    insertSelectionAndResizeIntoContainerFrames(containerFrames)
  }

  figma.currentPage.selection = containerFrames
  figma.viewport.scrollAndZoomIntoView(containerFrames)
}

main(selection)
closePlugin('Responsified ⚡️')