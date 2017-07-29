const {ipcRenderer} = require('electron')
const fs = require('fs')
const dir = require('node-dir')
const path = require('path')
const ghpages = require('gh-pages')
const rmrf = require('rimraf')

// exporters should optimize files first before deploying

module.exports = {

    github(project, service, pass) {

        ipcRenderer.send('set-service-status', 'busy', service)

        if (project.repo) {

            // Rewrite the repo url so it uses username and password, like: https://user:pass@github.com/etc.
            const repo = project.repo.replace(/github\.com/i, `${service.username}:${pass}@github.com`)

            ghpages.publish(`${project.path}/build`, {

                clone: `${project.path}/.clone`,
                repo: repo

            }, (err) => {

                if (err) {

                    console.log(err)
                    ipcRenderer.send('set-service-status', 'error', service, /*err.message*/'Authorization failed')

                } else {

                    ipcRenderer.send('set-service-status', 'done', service)
                }

                // Remove the temp folder when done
                rmrf(`${project.path}/.clone`, () => {})
            })
        }
    },


    ftp(project, service, pass) {

        const Client = require('ftp')
        const c = new Client()

        c.on('ready', err => {

            if (err) throw err

            c.cwd('/www', err => {

                if (err) throw err

                // Reads all the files in a directory
                dir.paths(`${project.path}/build/`, (err, paths) => {

                    if (err) throw err

                    paths.dirs.forEach(dir => {

                        c.mkdir(dir.replace(`${project.path}/build/`, ''), true, err => {

                            if (err) throw err
                        })
                    })

                    paths.files.forEach(file => {

                        const dest = file.replace(`${project.path}/build/`, '')

                        c.put(file, dest, err => {

                            if (err) throw err
                        })
                    })


                    c.end()
                });
            })
        })

        c.on('error', e => {

            ipcRenderer.send('set-service-status', 'error', service)
        })

        c.on('close', err => {

            if (!err) {

                ipcRenderer.send('set-service-status', 'done', service)
            }
        })

        ipcRenderer.send('set-service-status', 'busy', service)

        c.connect({
            host: service.host,
            port: service.port,
            user: service.username,
            password: pass
        })
    }
}