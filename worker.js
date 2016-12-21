const {ipcRenderer} = require('electron')
const Project = require('./project')

const projects = []

ipcRenderer.on('create-project', (e, project) => {

    projects.push(new Project(project))
})

ipcRenderer.on('start-server', (e, id) => {

    // find the project from the array
    const project = projects.find((item) => {

      return item.id == id
    })

    if(project) project.start()
})