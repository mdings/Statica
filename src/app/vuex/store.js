import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const {ipcRenderer} = require('electron')
const persist = require('./persist')
const store = new Vuex.Store({

    state: {

        activeProject: {},
        activeService: null
    },

    mutations: {

        SET_ACTIVE_PROJECT(state, project) {

            state.activeService = null // reset the active service
            state.activeProject = project
        },

        ADD_SERVICE(state, service) {

            state.activeProject.services.push(service)
            persist.setProjectById(state.activeProject)
        },

        EDIT_SERVICE(state, service) {

            const services = state.activeProject.services.map(originalService => {

                return originalService.id == service.id ? service : originalService
            })

            let project = state.activeProject
            project.services = services
            persist.setProjectById(project)

            console.log(project)
            state.activeService = service
        },

        REMOVE_SERVICE(state, service) {

            state.activeProject.services = state.activeProject.services.filter(originalService => {

                return originalService != service
            })

            persist.setProjectById(state.activeProject)
        },

        SET_ACTIVE_SERVICE(state, service) {

            state.activeService = service
        },

        SAVE_PROJECTS(state, projects) {

            persist.setAllProjects(projects)
        }
    },

    actions: {

        setActiveProject({commit}, project) {

            commit('SET_ACTIVE_PROJECT', project)
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

        saveProjects({commit}, projects) {

            commit('SAVE_PROJECTS', projects)
        },

        setActiveService({commit}, service) {

            commit('SET_ACTIVE_SERVICE', service)
        }
    },

    getters: {

        services: state => state.activeProject.services,
        activeService: state => state.activeService,
        activeProject: state => state.activeProject
    }
})

export default store