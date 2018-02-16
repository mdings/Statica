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
    store.set('projects', omit(projects, ['password']))
}

export const getProjectById = project => {
    return store.get('projects').find(p => p.id == project.id)
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
    store.set('projects', projects)
}