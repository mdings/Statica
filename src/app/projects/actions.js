export const actions = {
    loadAll: value => state => ({
        items: state.items.concat(value)
    }),
    add: value => state => ({
        items: state.items.concat(value)
    }),
    toggleFav: value => state => ({
        items: state.items.map(item => {
            if (item.id == value) {
                item.favourite = !item.favourite
                return item
            } else {
                return item
            }
        })
    })
}