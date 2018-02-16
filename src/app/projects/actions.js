export const actions = {
    loadAll: value => state => ({
        items: state.items.concat(value)
    }),
    toggleFav: value => state => {
        console.log('updating the fav to', value)
        return ({
            active: value
        })
    }
}