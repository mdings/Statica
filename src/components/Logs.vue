<template>
    <div id="logs">
        <header>
            Logs <span class="count" v-show="logs.length">{{logs.length}}</span>
            <svg @click="openOptions" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h48v48H0z" fill="none"/><path d="M24 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>
        </header>
        <div class="logs">
            <Log v-for="log in logs" :log="log"></Log>
            <div v-show="!logs.length" class="emptystate">
                There are no logs. Good job!
            </div>
        </div>
    </div>
</template>

<script>

    import '../sass/main.scss'
    import Log from './Log.vue'

    const {Menu, MenuItem} = require('electron').remote
    const {ipcRenderer} = require('electron')
    const fs = require('fs')
    const readline = require('readline')
    const stream = require('stream')

    export default {

        components: {

            Log
        },

        created() {

            const vm = this
            ipcRenderer.on('project-error', this.log)

            this.menu = new Menu()

            this.menu.append(new MenuItem({
                label: 'Clear logs',
                click() {

                    vm.logs = []
                }
            }))

            this.menu.append(new MenuItem({
                label: 'Show projects',
                click() {
                    vm.startProject()
                }
            }))

            this.menu.append(new MenuItem({
                type: 'separator'
            }))

            this.menu.append(new MenuItem({
                label: 'Exit statica',
                click() {
                    vm.startProject()
                }
            }))
        },

        data() {

            return {

                logs: []
            }
        },

        methods: {

            openOptions() {

                this.menu.popup(require('electron').remote.getCurrentWindow())
            },

            log(e, data) {

                if (data.lines && data.filename) {

                    data.lines = []
                    let i  = 1
                    const instream = fs.createReadStream(`${data.filename.dir}/${data.filename.base}`)
                    const outstream = new stream
                    const rl = readline.createInterface(instream, outstream)

                    rl.on('line', line => {

                        if (i > data.line) rl.close()

                        if (i == data.line) {

                            data.lines.push({i, line})
                        }

                        i++
                    })

                    rl.on('close', () => {

                        const win = require('electron').remote.getCurrentWindow()
                        const winWidth = win.getContentSize()[0]
                        this.logs.push(data)

                        // Wait for the DOM to be updated, then set the height of the window to the height of the last error message and scroll that into view
                        this.$nextTick(() => {

                            console.log('resizing!')

                            const elm = this.$el.querySelector('.logs')
                            const logElms = elm.querySelectorAll('.log')
                            const lastElm = logElms[logElms.length - 1]

                            elm.scrollTop = elm.scrollHeight
                            win.setContentSize(winWidth, lastElm.clientHeight + 53, true) // + header height (45px) + page offset (8px)
                        })
                    })
                } else {

                    this.logs.push(data)
                }
            }
        }
    }
</script>
