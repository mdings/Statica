import '../sass/reset.scss'
import { h, app as _app } from 'hyperapp'

import { actions } from './actions'
import { state } from './state'
import { Titlebar, Project, StatusBar } from './components'
import { openDialog, openMenu } from './electron'
import { getAllProjects } from '../persist'

const { ipcRenderer } = require('electron')

const favProjects = state => {
    return state.items.filter(project => project.favourite)
}

const otherProjects = state => {
    return state.items.filter(project => !project.favourite)
}

const view = (state, actions) => (
    <div class="window">
        <Titlebar openDialog={e => openDialog(actions)}/>
        <div class={state.isMessage ? 'message visible' : 'message hidden'}>There is an update available. Click to restart</div>
        <div class="body">
            <div class={state.items.length > 0 ? 'projects visible' : 'projects hidden'}>
                <div class={favProjects(state).length > 0 ? 'divider visible' : 'divider hidden'}>
                    <span class="sticky-label">Favourites</span>
                    <ul class="projects--favourite">
                        {favProjects(state).map(project => (
                            <Project openMenu={e => openMenu(actions, project)} project={project} toggleFav={actions.toggleFav} />
                        ))}
                    </ul>
                </div>
                <div class={(otherProjects(state).length) > 0 ? 'divider visible' : 'divider hidden'}>
                    <span class="sticky" class={(favProjects(state).length) > 0 ? 'sticky-label visible' : 'hidden'}>Others</span>
                    <ul>
                        {otherProjects(state).map(project => (
                            <Project openMenu={e => openMenu(actions, project)} project={project} toggleFav={actions.toggleFav} />
                        ))}
                    </ul>
                </div>
            </div>
            <div class={state.items.length > 0 ? 'empty-state hidden' : 'empty-state visible'}>
                There a no projects yet. Click the '+' to add a new folder or drag and drop one in the projects area.
            </div>
        </div>
        <StatusBar state={state} />
    </div>
)

// Bootstrap the app
const app = _app(state, actions, view, document.body)

const projects = getAllProjects()
projects.forEach(project => {
    ipcRenderer.send('createCompiler', project)
    project.block = true
    app.load(project)
})

// Listen for communications from the main window
ipcRenderer.on('createCompilerComplete', (e, project) => {
    app.unblock(project)
})

ipcRenderer.on('setIsCompiling', (e, {id}) => {
    app.addCompiling(id)
})

ipcRenderer.on('setIsCompilingSuccess', (e, {id}) => {
    app.removeCompiling(id)
})
