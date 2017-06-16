'use strict'

const {ipcRenderer} = require('electron')
const Statica = require('./compiler/statica')
let projects = []

ipcRenderer.on('create-compiler', (e, project) => {

    console.log('creating compiler')
    projects.push(new Statica(project))
})

ipcRenderer.on('remove-compiler', (e, id) => {

    // find the project from the array
    const project = projects.find(item => {

      return item.project.id == id
    })

    if (project) {

        project.destroy()
    }
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