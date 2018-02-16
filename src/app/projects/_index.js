import { h, app as _app } from 'hyperapp'

import { actions } from './actions'
import { state } from './state'
import { Titlebar, Project } from './components'
import { getAllProjects } from '../persist'
import { openDialog } from './electron'

const view = (state, actions) => (
    <div class="window">
        <Titlebar openDialog={e => openDialog(actions)}/>
        <div class="projects body">
            {state.items.map(project => (
               <Project project={project} toggleFav={actions.toggleFav} />
            ))}
        </div>
    </div>
)

// Bootstrap the app
const app = _app(state, actions, view, document.body)
const projects = getAllProjects()
app.loadAll(projects)