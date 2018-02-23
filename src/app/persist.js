const omit = require('omit-deep')
const Store = require('electron-store')
const store = new Store()

export const clearAllProjects = () => {
    store.delete('projects')
}

export const getAllProjects = () => {
    return store.get('projects') || []
}

export const setAllProjects = projects => {
    // Make sure we don't save any passwords in the json file
    store.set('projects', omit(projects, ['password', 'blocked']))
}

export const getProjectById = id => {
    return store.get('projects').find(project => project.id == id)
}

export const setProjectById = project => {
    let projects = store.get('projects')
    projects = projects.map(current => {
        if (current.id == project.id) {
            return project
        } else {
            return current
        }
    })
    setAllProjects(projects)
}

export const setServicesByProjectId = (id, services) => {
    const project = getProjectById(id)
    project.services = services
    setProjectById(project)
}