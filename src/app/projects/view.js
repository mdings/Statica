import '../sass/reset.scss'
import { h, app as _app } from 'hyperapp'

import { actions } from './actions'
import { state } from './state'
import { Titlebar, Project, StatusBar } from './components'
import { openDialog, openMenu } from './electron'
import { getAllProjects } from '../persist'

const favProjects = state => {
    return state.items.filter(project => project.favourite)
}

const otherProjects = state => {
    return state.items.filter(project => !project.favourite)
}

const view = (state, actions) => (
    <div class="window">
        <Titlebar openDialog={e => openDialog(actions)}/>
        <div class="projects body">
            <div class="divider" class={favProjects(state).length > 0 ? 'visible' : 'hidden'}>
                <span class="sticky">Favourites</span>
                <ul class="projects--favourite">
                    {favProjects(state).map(project => (
                        <Project openMenu={e => openMenu(actions, project)} project={project} toggleFav={actions.toggleFav} />
                    ))}
                </ul>
            </div>
            <div class="divider" class={(otherProjects(state).length) > 0 ? 'visible' : 'hidden'}>
                <span class="sticky" class={(favProjects(state).length) > 0 ? 'visible' : 'hidden'}>Others</span>
                <ul>
                    {otherProjects(state).map(project => (
                        <Project openMenu={e => openMenu(actions, project)} project={project} toggleFav={actions.toggleFav} />
                    ))}
                </ul>
            </div>
        </div>
        <StatusBar projects={state.items} />
    </div>
)

// Bootstrap the app
const app = _app(state, actions, view, document.body)
const projects = getAllProjects()
app.loadAll(projects)