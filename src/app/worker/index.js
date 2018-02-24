'use strict'

console.log('ok')

const path = require('upath')
const chokidar = require('chokidar')
const { ipcRenderer } = require('electron')
const Statica = require('../../compiler/statica')
const fs = require('fs')

const compilers = {}

ipcRenderer.on('optimizeProject', (e, id) => {
    // find the project from the array
    const compiler = compilers.find(item => {
        return item.project.id == id
    })

    if (compiler) {
        compiler.optimize().then(() => {
            ipcRenderer.send('doneOptimizeProject', compiler.project)
        })
    }
})

ipcRenderer.on('createCompiler', (e, project) => {
    compilers[project.id] = new Statica(project)
    let compiler = compilers[project.id]
    compiler.on('ready', project => {
        ipcRenderer.send('createCompilerComplete', project)
    })
    compiler.on('change', project => {
        ipcRenderer.send('setIsCompiling', project)
    })
    compiler.on('success', project => {
        ipcRenderer.send('setIsCompilingSuccess', project)
    })
    compiler.on('error', project => {
        ipcRenderer.send('setIsCompilingSuccess', project)
    })
})

ipcRenderer.on('removeProject', (e, id) => {
    if (compilers[id]) {
        compilers[id].destroy()
        delete compilers[id]
    }
})

ipcRenderer.on('startServer', (e, id) => {
    console.log('starting', compilers[id])
    if (compilers[id]) {
        compilers[id].launch()
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
// ipcRenderer.on('createCompiler', (e, project) => {

//     projects.push({

//         path: project.path,
//         files: []
//     })
//     watch.add(project.path)

// })

// ipcRenderer.on('removeCompiler', (e, id) => {

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