const {ipcRenderer} = require('electron')
const fs = require('fs')
const dir = require('node-dir')
const path = require('path')

module.exports = {

    ftp(project, service, pass) {

        const Client = require('ftp')
        const c = new Client()

        c.on('ready', e => {

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

            ipcRenderer.send('project-error', {

                project,
                message: e,
                filename: 'no filename',
                line: 'no line'
            })
        })

        c.on('end', e => {

            ipcRenderer.send('project-error', {

                project,
                message: 'done uploading',
                filename: 'no filename',
                line: 'no line'
            })
        })

        console.log(service, pass)

        c.connect({
            host: service.host,
            port: service.port,
            user: service.username,
            password: pass
        })

        // Send the status of the connection to the tray
        ipcRenderer.send('project-error', {

            project,
            message: 'connection to ftp...',
            filename: 'no filename',
            line: 'no line'
        })


    //     const deployer = new ftp()

    //     deployer.connect({

    //         username: service.username,
    //         password: 'kxdfkJmH29',
    //         host: service.host,
    //         port: service.port,
    //     })


    //     deployer.upload(project.path + '/build/**/*', '/www/statica/', e => {

    //         if (e) {

    //             console.log(e)
    //         }

    //         deployer.close()
    //     })
    //     //@TODO: check for the localroot to exist
    // }
    }
}