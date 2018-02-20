import '../sass/reset.scss'
import { h, app as _app } from 'hyperapp'

import { actions } from './actions'
import { state } from './state'
import { Titlebar, SlidePane, Exporter, Table, ActionBar } from './components';

const { ipcRenderer } = require('electron')

const view = (state, actions) => {

    // Nono, close the window when we have no project to render services for otherwise we will get errors
    if (!state.project) {
        const win = require('electron').remote.getCurrentWindow()
        win.close()
        return false
    }

    return (
        <div class="window">
            <Titlebar
                addButtonClick={e => actions.addButtonClick()}
                isPaneActive={state.isPaneActive}
                project={state.project} />
            <div class="services body">
                <Table cols={['Title', 'Type']}>
                    {state.items.map(service => (
                        <li onclick={e => actions.setActive(service)}
                        class={service == state.active ? 'service is-active' : 'service'}>
                            <span class="title">{service.title}</span>
                            <span class="type">{service.type}</span>
                        </li>
                    ))}
                </Table>
            </div>
            <ActionBar editButtonClick={e => actions.editButtonClick()} remove={e => actions.remove()} />
            <SlidePane isPaneActive={state.isPaneActive}>
                <label>Choose a service</label>
                <select onchange={e => actions.setService(e.target.options[e.target.selectedIndex].value)}>
                    <option value="FTP">FTP</option>
                    <option value="GithubPages">Github pages</option>
                </select>
                <Exporter
                    type={state.type}
                    isButtonDisabled={state.isButtonDisabled}
                    add={e => actions.add(e)}
                    activeService={state.active}
                    checkValidity={e => actions.checkValidity(e)} />
            </SlidePane>
        </div>
    )
}

// Bootstrap the app
const app = _app(state, actions, view, document.body)
app.setService('FTP')

// Listen for updates from the main process
ipcRenderer.on('getServicesForProject', (e, id) => {
    app.load(id)
})