import deviceSizes from './sizes'
const { command, currentPage } = figma
const { selection } = currentPage
const end = figma.closePlugin

const all = [...Object.keys(deviceSizes).map(key => deviceSizes[key])]
const devices = command === 'all'
  ? [].concat.apply([], all)
  : deviceSizes[command] 

function hasValidSelection(nodes) {
  const frameTypes = ["FRAME", "COMPONENT", "INSTANCE"]
  const oneSelected = nodes.length === 1
  if (!oneSelected) return false
  
  const isFrame = frameTypes.indexOf(nodes[0].type) >= 0
  return isFrame
}

function main(nodes) {
  if (!hasValidSelection(selection)) {
    return end('Select a single frame to test responsive sizes')
  }

  // the frame to clone
  const selectedFrame = nodes[0]

  function generateContainerFrames() {
    let frames: FrameNode[] = []
    
    for (let [index, device] of devices.entries()) {
      // create an empty container
      const frame = figma.createFrame()
      // place the first container 100px to the right of the selected frame
      const startPos = selectedFrame.x + selectedFrame.width + 100
      // resize and name the container according to the device
      frame.resize(device.width, device.height)
      frame.name = device.name
  
      // for each subsequent device being tested, make sure it is always
      // placed 100px to the right of the previous device
      const widthOfAllPreviousFramesPlusGaps = devices
        .slice(0, index)
        .reduce((acc, curr) => acc += curr.width + 100, startPos)
  
      let x = widthOfAllPreviousFramesPlusGaps
      frame.x = x
      // top-align the containers to the selected node
      frame.y = selectedFrame.y
      frames.push(frame)
    }
    return frames
  }

  function insertSelectionAndResizeIntoContainerFrames(containerFrames) {
    for (let container of containerFrames) {
      const clone = selectedFrame.clone()
      clone.x = 0
      clone.y = 0
      clone.resize(container.width, container.height)
      container.appendChild(clone)
    }
  }

  const containerFrames = generateContainerFrames()
  insertSelectionAndResizeIntoContainerFrames(containerFrames)

  figma.currentPage.selection = containerFrames
  figma.viewport.scrollAndZoomIntoView(containerFrames)
}

main(selection)
end('Responsified ⚡️')