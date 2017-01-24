'use strict'

const path = require('path')
const mm = require('marky-mark')

class Collection {

    constructor() {
    }

    set(dir) {
        const collection = mm.parseMatchesSync(dir, ['*.md'])
        if (collection.length) {
            const name = path.basename(dir)
            if (this.hasOwnProperty(name)) {
                this[name] = collection
            } else {
                Object.defineProperty(this, name, {
                    value: collection, 
                    writable: true
                })
            }
        }
    }
    
    get all() {
        return this
    }
}

module.exports = Collection