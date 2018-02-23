import id from 'shortid'
import { ipcRenderer } from 'electron'
import { Service } from './models'
import { getProjectById, setServicesByProjectId } from '../persist'

import FTP from './ftp'
const exporters = {
    FTP
}

export const actions = {
    load: id => state => {
        const project = getProjectById(id)
        console.log(project.services)
        return ({
            active: null,
            isButtonDisabled: true,
            isPaneActive: false,
            project: project,
            items: project.services
        })
    },
    add: e => state => {
        e.preventDefault()
        if (state.project) {
            state.fields.id = id.generate()
            state.fields.type = state.type
            const items = state.items.concat([state.fields])
            const isPasswordSet = ipcRenderer.sendSync('storePassword', state.fields)
            if (isPasswordSet) {
                setServicesByProjectId(state.project.id, items)
            }
            return ({ items, isPaneActive: false })
        }
    },
    edit: e => state => {
        e.preventDefault()
        if (state.project) {
            const isPasswordSet = ipcRenderer.sendSync('storePassword', state.fields)
            const items = state.items.map(
                item => item.id == state.fields.id ? state.fields : items
            )
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
            active: null,
            items: state.items
        })
    },
    setService: value => state => {
        // const select = e.target
        // const value = select.options[select.selectedIndex].value
        return ({
            fields: {},
            isButtonDisabled: true,
            type: value
        })
    },
    setActive: service => state => ({
        fields: service,
        active: service,
        type: service.type
    }),
    resetFields: value => state => ({fields: {}}),
    addButtonClick: value => (state, actions) => {
        return ({
            inputMode: state.inputModes[0],
            isButtonDisabled: true,
            fields: state.isPaneActive ? state.fields : {},
            isPaneActive: !state.isPaneActive
        })
    },
    editButtonClick: value => state => {
        const password = ipcRenderer.sendSync('retrievePassword', state.active)
        const fields = state.active
        fields.password = password
        return ({
            inputMode: state.inputModes[1],
            isButtonDisabled: false,
            fields: fields,
            isPaneActive: true
        })
    },
    deploy: value => (state, actions) => {
        console.log(state.active)
        const password = ipcRenderer.sendSync('retrievePassword', state.active)
        const exporter = new exporters[state.active.type](actions, state.active, password)
        exporter.run()
    },
    checkValidity: e => state => {
        const form = e.target.parentNode
        const fields = form.querySelectorAll(`[required]`)
        const invalidated = Array.from(fields).filter(field => !field.checkValidity())
        // Make sure we update the relative field for the active state as well, otherwise the input freezes
        state.fields[e.target.getAttribute('name')] = e.target.value
        return ({
            fields: state.fields,
            isButtonDisabled: invalidated.length > 0 ? true : false
        })
    },
    showActivity: value => state => ({
        isActivity: value
    }),
    hideActivity: value => state => ({
        isActivity: null
    })
}