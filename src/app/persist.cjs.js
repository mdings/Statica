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
    store.set('projects', omit(projects, ['password']));
};

const getProjectById = project => {
    return store.get('projects').find(p => p.id == project.id)
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

exports.clearAllProjects = clearAllProjects;
exports.getAllProjects = getAllProjects;
exports.setAllProjects = setAllProjects;
exports.getProjectById = getProjectById;
exports.setProjectById = setProjectById;
