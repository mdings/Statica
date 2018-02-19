const path = require('upath')
const id = require('shortid')

export const Service = type => {
    console.log(type)
    const form = document.querySelector(`input[value="${type}"]`).parentNode
    const formData = new FormData(form)
    console.log(formData)
}