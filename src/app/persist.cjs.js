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

const setAllProjects = projects => {
    // Make sure we don't save any passwords in the json file
    store.set('projects', omit(projects, ['password']));
};

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
    setAllProjects(projects);
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
