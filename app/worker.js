'use strict'

const {ipcRenderer} = require('electron')
const Statica = require('./lib/statica')
const projects = []

ipcRenderer.on('create-project', (e, project) => {

    projects.push(new Statica(project))
})

ipcRenderer.on('start-server', (e, id) => {

    // find the project from the array
    const project = projects.find((item) => {

      return item.project.id == id
    })

    console.log(project)
    if (project) {

        project.launch()
    }
})