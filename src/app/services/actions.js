import { Service } from './models'
import { getProjectById, setServicesByProjectId } from '../persist';

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
            state.active.type = state.type
            const projectId = state.project.id
            const items = state.items.concat([state.active])
            setServicesByProjectId(projectId, items)
            return ({ items, isPaneActive: false })
        }
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
    toggleAdding: (value = null) => state => {
        const model = Service(state.type)
        return ({
            active: null,
            isPaneActive: value ? value : !state.isPaneActive
        })
    },
    checkValidity: e => state => {
        const form = e.target.parentNode
        const fields = form.querySelectorAll(`[required]`)
        const invalidated = Array.from(fields).filter(field => !field.checkValidity())

        // Make sure we update the relative field for the active state as well, otherwise the input freezes
        state.active = state.active || {}
        state.active[e.target.getAttribute('name')] = e.target.value

        console.log('updating', e.target.getAttribute('name'), e.target.value)
        return ({
            active: state.active,
            isButtonDisabled: invalidated.length > 0 ? true : false
        })
    }
}