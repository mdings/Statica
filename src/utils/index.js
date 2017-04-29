const $ = (elm) => {

    return document.querySelector(elm)
}

const e = (elm, on, cb = null) => {

    if (typeof on === 'function') {

        cb = on
        on = 'click'
    }

    return elm.addEventListener(on, e => {

        if (typeof cb === 'function') {

            cb.call(this, e)
        }
    })
}

module.exports = {
    $, e
}