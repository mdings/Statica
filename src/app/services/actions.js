import id from 'shortid'
import { ipcRenderer } from 'electron'
import { Service } from './models'
import { getProjectById, setServicesByProjectId } from '../persist'

import ftp from './ftp'

export const actions = {
    load: id => state => {
        const project = getProjectById(id)
        return ({
            project: project,
            items: project.services
        })
    },
    add: e => state => {
        e.preventDefault()
        if (state.project) {
            state.active.id = id.generate()
            state.active.type = state.type
            const items = state.items.concat([state.active])
            const isPasswordSet = ipcRenderer.sendSync('storePassword', state.active)
            if (isPasswordSet) {
                setServicesByProjectId(state.project.id, items)
            }
            return ({ items, isPaneActive: false })
        }
    },
    remove: value => state => {
        const index = state.items.indexOf(state.active)
        state.items.splice(index, 1)
        setServicesByProjectId(state.project.id, state.items)
        return ({
            active: {},
            items: state.items
        })
    },
    setService: value => state => {
        // const select = e.target
        // const value = select.options[select.selectedIndex].value
        return ({
            isButtonDisabled: true,
            type: value
        })
    },
    setActive: service => state => ({
        active: service,
        type: service.type
    }),
    addButtonClick: value => state => ({
        active: {},
        isPaneActive: !state.isPaneActive
    }),
    editButtonClick: value => state => ({
        isPaneActive: true
    }),
    checkValidity: e => state => {
        const form = e.target.parentNode
        const fields = form.querySelectorAll(`[required]`)
        const invalidated = Array.from(fields).filter(field => !field.checkValidity())
        // Make sure we update the relative field for the active state as well, otherwise the input freezes
        state.active[e.target.getAttribute('name')] = e.target.value
        return ({
            active: state.active,
            isButtonDisabled: invalidated.length > 0 ? true : false
        })
    }
}