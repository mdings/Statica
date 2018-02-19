const omit = require('omit-deep')
const Store = require('electron-store')
const store = new Store()

export const clearAllProjects = () => {
    store.delete('projects')
}

export const getAllProjects = () => {
    return store.get('projects') || []
}

// export const getAllServices = id => {
//     const services = store.get('services') || []
//     return services.filter(service => service.project == id)
// }

export const setAllProjects = projects => {
    store.set('projects', projects)
}

// export const setAllServices = services => {
//     // Make sure we don't save any passwords in the json file
//     store.set('services', omit(services, ['password']))
// }

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
    store.set('projects', projects)
}

export const setServicesByProjectId = (id, services) => {
    const project = getProjectById(id)
    project.services = services
    setProjectById(project)
}