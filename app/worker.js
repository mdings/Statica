'use strict'

const {ipcRenderer} = require('electron')
const Compiler = require('./lib/compiler')
const projects = []

ipcRenderer.on('create-project', (e, project) => {
    projects.push(new Compiler(project))
})

ipcRenderer.on('start-server', (e, id) => {
    // find the project from the array
    const compiler = projects.find((item) => {
      return item.project.id == id
    })

    if (compiler) {
        compiler.open()
    }
})