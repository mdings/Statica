'use strict'

const path = require('upath')
const chokidar = require('chokidar')
const {ipcRenderer} = require('electron')
const Statica = require('../compiler/statica')
const fs = require('fs')

const projects = []


ipcRenderer.on('optimize-project', (e, id) => {

    // find the project from the array
    const project = projects.find(item => {

        return item.project.id == id
    })

    if (project) {

        project.optimize().then(e => {

            console.log('done optimizing')
        })
    }
})

ipcRenderer.on('create-compiler', (e, project) => {

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











// const watch = new chokidar.watch(null, {ignored: ignored('build')})
// const getProject = (path) => {

//     return projects.find(project => {

//         return new RegExp(project.path).test(path)
//     })
// }

// watch.on('change', filename => {

//     console.log(filename, 'is in project', getProject(filename))
// })


// watch.on('add', filename => {

//     const project = getProject(filename)
//     projects.forEach(item => {

//         if (item.path == project.path) {

//             item.files.push(filename)
//         }
//     })
// })

// setTimeout(() => {

//     console.log(projects)
// }, 5000)
// ipcRenderer.on('create-compiler', (e, project) => {

//     projects.push({

//         path: project.path,
//         files: []
//     })
//     watch.add(project.path)

// })

// ipcRenderer.on('remove-compiler', (e, id) => {

//     // find the project from the array
//     const project = projects.find(item => {

//       return item.project.id == id
//     })

//     if (project) {

//         project.destroy()
//     }
// })

// ipcRenderer.on('startServer', (e, id) => {

//     // find the project from the array
//     const project = projects.find(item => {

//       return item.project.id == id
//     })

//     if (project) {

//         project.launch()
//     }
// })