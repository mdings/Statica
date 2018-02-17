const path = require('upath')

export const project = folder => ({
    id: require('shortid').generate(),
    name: path.basename(folder),
    favourite: false,
    blocked: true,
    path: folder,
    isRunning: false,
})