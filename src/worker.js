'use strict'

const path = require('upath')
const chokidar = require('chokidar')
const {ipcRenderer} = require('electron')
const fileTypes  = require('require-dir')('./compiler/files')
const extensions  = require('./compiler/extensions')
const ignored = require('./compiler/ignored')
const Statica = require('./compiler/statica')
const fs = require('fs')

const projects = []

// class Worker {

//     constructor() {

//         // Setup an empty worker for now
//         this.watcher = chokidar.watch(null, {ignored: ignored('build')})
//         this.projects = []

//         // Listen for file updates
//         this.watcher.on('change', filename => this.render(filename))
//         this.watcher.on('add', filename => this.add(filename))
//     }

//     project(path) {

//         return this.projects.find(project => {

//             return new RegExp(project.path).test(path)
//         })
//     }

//     render(filename) {

//         const project = this.project(filename)
//         const ext = path.extname(filename).toLowerCase()
//         const type = extensions[ext] || 'other'

//         // Do the actual rendering
//         fileTypes[type].render(project.path, filename)
//     }

//     add(filename) {

//         console.log('adding file')

//         const project = this.project(filename)
//         this.projects.forEach(item => {

//             if (item.path == project.path) {

//                 item.files.push(filename)
//             }
//         })
//     }
// }

// const worker = new Worker()

// ipcRenderer.on('create-compiler', (e, project) => {

//     worker.projects.push({

//         path: project.path,
//         files: []
//     })

//     worker.watcher.add(project.path)
// })



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