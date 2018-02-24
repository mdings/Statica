import { setAllProjects } from '../persist'
import { ipcRenderer }  from 'electron'
import { Project } from './models'

export const actions = {
    load: value => state => ({
        items: state.items.concat(value)
    }),
    add: project => state => {
        const items = state.items.concat(project)
        setAllProjects(items)
        ipcRenderer.send('createCompiler', project)
        return ({ items })
    },
    remove: project => state => {
        const index = state.items.indexOf(project)
        state.items.splice(index, 1)
        setAllProjects(state.items)
        ipcRenderer.send('removeProject', project)
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
    startServer: project => state => {
        ipcRenderer.send('startServer', project)
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
    },
    drag: {
        enter: e => state => ({ isBusy: true, isActive: true }),
        drop: root_actions => (state, actions) => {
            const files = event.dataTransfer.files
            Object.keys(files).forEach(file => {
                const project = Project(files[file].path)
                root_actions.add(project)
            })
            return ({ isBusy: false, isActive: false })
        },
        end: e => state => ({ isBusy: false, isActive: false }),
        over: e => state => {
            e.dataTransfer.dropEffect = 'move'
            e.preventDefault()
        },
        leave: e => state => {
            if (!state.isBusy) {
                return ({ isActive: false })
            }
            return ({ isBusy: false })
        }
    }
}