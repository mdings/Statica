import { setAllProjects } from '../persist'

const { ipcRenderer } = require('electron')

export const actions = {
    load: value => state => ({
        items: state.items.concat(value)
    }),
    add: project => state => {
        const items = state.items.concat(project)
        setAllProjects(items)
        ipcRenderer.send('createCompiler', project[0])
        return ({ items })
    },
    remove: value => state => {
        const index = state.items.indexOf(value)
        state.items.splice(index, 1)
        setAllProjects(state.items)
        return ({ items: state.items })
    },
    unblock: project => state => { console.log(`unblocking, ${project.name}`)
        return ({
        items: state.items
            .map(item => {
                item.block = item.block && project.id != item.id
                return item
        })
    })},
    toggleFav: value => state => {
        const items = state.items.map(item => {
            item.favourite = item.id == value ? !item.favourite : item.favourite
            return item
        })
        setAllProjects(items)
        return ({ items })
    },
    addCompiling: id => state => {
        const project = state.items.find(
            item => item.id == id
        )
        return ({
            compiling: [...new Set(state.compiling.concat(project.name))]
        })
    },
    removeCompiling: id => state => {
        const project = state.items.find(
            item => item.id == id
        )
        console.log(project)
        const compiling = state.compiling.filter(
            item => item != project.name
        )
        return ({ compiling })
    }
}