'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const omit = require('omit-deep');
const Store = require('electron-store');
const store = new Store();

const clearAllProjects = () => {
    store.delete('projects');
};

const getAllProjects = () => {
    return store.get('projects') || []
};

// export const getAllServices = id => {
//     const services = store.get('services') || []
//     return services.filter(service => service.project == id)
// }

const setAllProjects = projects => {
    store.set('projects', projects);
};

// export const setAllServices = services => {
//     // Make sure we don't save any passwords in the json file
//     store.set('services', omit(services, ['password']))
// }

const getProjectById = id => {
    return store.get('projects').find(project => project.id == id)
};

const setProjectById = project => {
    let projects = store.get('projects');
    projects = projects.map(current => {
        if (current.id == project.id) {
            return project
        } else {
            return current
        }
    });
    store.set('projects', projects);
};

const setServicesByProjectId = (id, services) => {
    const project = getProjectById(id);
    project.services = services;
    setProjectById(project);
};

exports.clearAllProjects = clearAllProjects;
exports.getAllProjects = getAllProjects;
exports.setAllProjects = setAllProjects;
exports.getProjectById = getProjectById;
exports.setProjectById = setProjectById;
exports.setServicesByProjectId = setServicesByProjectId;
