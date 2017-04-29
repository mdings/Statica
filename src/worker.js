'use strict'

const {ipcRenderer} = require('electron')
const Statica = require('./compiler/statica')
const projects = []

ipcRenderer.on('create-project', (e, project) => {

    projects.push(new Statica(project))
})

ipcRenderer.on('startServer', (e, id) => {

    // find the project from the array
    const project = projects.find(item => {

      return item.project.id == id
    })

    if (project) {

        project.launch()
    }
})