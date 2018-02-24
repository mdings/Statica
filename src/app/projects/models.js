const path = require('upath')
const id = require('shortid')

export const Project = folder => ({
    id: id.generate(),
    name: path.basename(folder),
    favourite: false,
    block: true,
    path: folder,
    services: []
})