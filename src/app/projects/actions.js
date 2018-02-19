import { setAllProjects } from '../persist'

export const actions = {
    load: value => state => ({
        items: state.items.concat(value)
    }),
    add: value => state => {
        const items = state.items.concat(value)
        setAllProjects(items)
        return ({ items })
    },
    remove: value => state => {
        const index = state.items.indexOf(value)
        state.items.splice(index, 1)
        setAllProjects(state.items)
        return ({ items: state.items })
    },
    toggleFav: value => state => {
        const items = state.items.map(item => {
            item.favourite = item.id == value ? !item.favourite : item.favourite
            return item
        })
        setAllProjects(items)
        return ({ items })
    }
}