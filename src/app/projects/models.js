const path = require('upath')
const id = require('shortid')

export const project = folder => ({
    id: id.generate(),
    name: path.basename(folder),
    favourite: false,
    path: folder,
    services: []
})