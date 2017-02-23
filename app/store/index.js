const storage = require('electron-json-storage')


const clearAllProjects = () => {

    return storage.clear(e => {

        if (e) throw e
    })
}

const getAllProjects = () => {

    return new Promise((resolve, reject) => {

        storage.get('projects', (e, result) => {

            if (e) reject(e)

            resolve(result)
        })
    })
}

const setAllProjects = (projects) => {

    storage.set('projects', projects, (e) => {

        if (e) throw e
    })
}

const getProjectById = (id) => {

    return new Promise((resolve, reject) => {

        getAllProjects()
        .then(projects => {

            const project = projects.find(p => {

                return p.id == id
            })

            resolve(project)
        })
    })
}

const setProjectById = (project) => {

    getAllProjects()
    .then(projects => {

        for (var i in projects) {

            if (projects[i].id == project.id) {

                projects[i] = project
                break
            }
        }

        setAllProjects(projects)
    })
}

module.exports = {
    clearAllProjects,
    getAllProjects,
    setAllProjects,
    getProjectById,
    setProjectById
}
