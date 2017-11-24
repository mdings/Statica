import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const {ipcRenderer} = require('electron')
const persist = require('./persist')
const fs = require('fs')
const parse = require('parse-git-config')

const storePass = (service) => {

    // Store password fields safely with keytar
    if (service.password) {

        ipcRenderer.send('storePassword', {

            // projectId: this.project,
            serviceId: service.id,
            password: service.password
        })

    }
}

const store = new Vuex.Store({

    state: {

        projects: [],
        activeProject: {},
        activeService: null,
        isFormOpen: false,
        action: null
    },

    mutations: {

        GET_ALL_PROJECTS(state) {

            const projects = persist.getAllProjects()

            projects.forEach(project => {

                project.status = 'indexing'

                // Check if the path still exists for the project
                if (!fs.existsSync(project.path)) {

                    project.unlinked = true
                }

                // Check if the project is coming from git and append that to the project before sending it to the UI
                const config = parse.sync({
                    cwd: project.path,
                    path: '.git/config'
                })

                if (config['remote "origin"']) {

                    project.repo = config['remote "origin"'].url
                }

                state.projects.push(project)
            })

            state.projects.forEach(project => ipcRenderer.send('create-compiler', project))
            persist.setAllProjects(state.projects)
        },

        SET_ACTIVE_PROJECT(state, project) {

            state.activeProject = project
        },

        ADD_PROJECT(state, project) {

            ipcRenderer.send('create-compiler', project)

            console.log(project)
            state.projects.push(project)
            persist.setAllProjects(state.projects)
        },

        ADD_SERVICE(state, service) {

            storePass(service)
            if (!state.activeProject.services) {

                state.activeProject.services = []
            }
            state.activeProject.services.push(service)
            persist.setProjectById(state.activeProject)
        },

        EDIT_SERVICE(state, service) {

            storePass(service)
            const services = state.activeProject.services.map(originalService => {

                return originalService.id == service.id
                    ? service
                    : originalService
            })

            let project = state.activeProject
            project.services = services
            persist.setProjectById(project)
        },

        REMOVE_SERVICE(state, service) {

            state.activeProject.services = state.activeProject.services.filter(originalService => {

                return originalService != service
            })

            persist.setProjectById(state.activeProject)
        },

        REMOVE_PROJECT(state, project) {

            const projects = state.projects.filter(item => item != project)
            state.projects = projects
            persist.setAllProjects(projects)
            ipcRenderer.send('remove-compiler', project)
        },

        SET_ACTIVE_SERVICE(state, service) {

            // Retrieve the password from the service
            const password = ipcRenderer.sendSync('retrievePassword', service.id)
            console.log('your password is ', password, ':)')
            service.password = password
            state.activeService = service
        },

        RESET_ACTIVE_SERVICE(state) {

            state.activeService = null
        },

        SET_PROJECT_STATUS(state, data) {

            state.projects = state.projects.map(project => {

                if (project.id == data.project.id) {

                    project.status = data.status
                }

                return project
            })
        },

        SAVE_PROJECTS(state, projects) {

            persist.setAllProjects(state.projects)
        },

        SHOW_FORM(state, action) {

            state.action = action
            state.isFormOpen = true
        },

        HIDE_FORM(state) {

            // If the form is already open we want the dynamic form only to update when the animation is done
            if (state.isFormOpen) {

                const form = document.querySelector('[data-form]')
                const removeAction = (e) => {

                    if (!form.classList.contains('visible')) {

                        state.action = null
                    }

                    form.removeEventListener('transitionend', removeAction)
                }

                state.isFormOpen = false
                form.addEventListener('transitionend', removeAction)

            } else {

                state.action = null
                state.isFormOpen = false
            }

        }
    },

    actions: {

        getAllProjects({commit}) {

            commit('GET_ALL_PROJECTS')
        },

        setActiveProject({commit}, project) {

            commit('HIDE_FORM')
            commit('SET_ACTIVE_PROJECT', project)
        },

        addProject({commit}, project) {

            commit('ADD_PROJECT', project)
        },

        addService({commit}, service) {

            commit('ADD_SERVICE', service)
        },

        editService({commit}, service) {

            commit('EDIT_SERVICE', service)
        },

        removeService({commit}, service) {

            commit('REMOVE_SERVICE', service)
        },

        removeProject({commit}, project) {

            commit('REMOVE_PROJECT', project)
        },

        setProjectStatus({commit}, data) {

            commit('SET_PROJECT_STATUS', data)
        },

        setActiveService({commit}, service) {

            commit('SET_ACTIVE_SERVICE', service)
        },

        resetActiveService({commit}) {

            commit('RESET_ACTIVE_SERVICE')
        },

        saveProjects({commit}, projects) {

            commit('SAVE_PROJECTS', projects)
        },

        showForm({commit}, action) {

            commit('SHOW_FORM', action)
        },

        hideForm({commit}) {

            commit('HIDE_FORM')
        }
    },

    getters: {

        projects: state => state.projects,
        services: state => state.activeProject.services,
        activeService: state => state.activeService,
        activeProject: state => state.activeProject,
        isFormOpen: state => state.isFormOpen,
        action: state => state.action
    }
})

ipcRenderer.on('status-update', (e, data) => {

    store.dispatch('setProjectStatus', data)
})

export default store