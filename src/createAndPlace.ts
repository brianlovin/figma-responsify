interface Device {
  name: string;
  width: number;
  height: number
}


interface Props {
  device: Device;
  devices: Device[];
  index: number;
  selectedNode: SceneNode
}

function place(frame, props: Props) {
  const { selectedNode, device, devices, index } = props

  // place the first container 100px to the right of the selected frame
  const startPos = selectedNode.x + selectedNode.width + 100
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
  frame.y = selectedNode.y
  return frame
}

export function createAndPlace(props) {
  const { selectedNode } = props
  
  if (selectedNode.type === 'FRAME') {
    const frame = figma.createFrame()
    place(frame, props)
    return frame
  }

  if (selectedNode.type === 'COMPONENT') {
    const instance = selectedNode.createInstance()
    place(instance, props)
    return instance
  }
}