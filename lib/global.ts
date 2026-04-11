declare global {
  var onlineTrackers: Set<string>
  var trackerLocations: Map<string, any>
}

global.onlineTrackers = global.onlineTrackers || new Set()
global.trackerLocations = global.trackerLocations || new Map()

export {}
