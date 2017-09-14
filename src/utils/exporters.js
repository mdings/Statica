const {ipcRenderer} = require('electron')
const fs = require('fs')
const dir = require('node-dir')
const path = require('path')
const ghpages = require('gh-pages')
const rmrf = require('rimraf')
const notifier = require('node-notifier')

// exporters should optimize files first before deploying

module.exports = {

    GithubPages(project, service, pass, vm) {

        vm.$root.$emit('activityLogger', `Deploying to github repo..`)

        if (project.repo) {

            // Rewrite the repo url so it uses username and password, like: https://user:pass@github.com/etc.
            const repo = project.repo.replace(/github\.com/i, `${service.username}:${pass}@github.com`)

            ghpages.publish(`${project.path}/build`, {

                clone: `${project.path}/.clone`,
                repo: repo

            }, (err) => {

                vm.$root.$emit('hideActivityLogger')

                if (err) {

                    notifier.notify({

                        title: `Failed to push to Github: ${project.name}`,
                        message: err.message,
                        group: 'statica', // only display one notification per app
                        sound: 'Purr'
                    });

                } else {

                    notifier.notify({

                        title: `${project.name}`,
                        message: 'Successfully deployed to Github Pages!',
                        group: 'statica', // only display one notification per app
                        sound: 'Purr'
                    });
                }

                // Remove the temp folder when done
                rmrf(`${project.path}/.clone`, () => {})
            })
        }
    },


    FTP(project, service, pass, vm) {

        const Client = require('ftp')
        const c = new Client()

        c.on('ready', () => {

            const homedir = service.homedir || '/'

            c.cwd(homedir, err => {

                if (err) {

                    notifier.notify({

                        title: `Failed to FTP into ${project.name}`,
                        message: err.message,
                        group: 'statica', // only display one notification per app
                        sound: 'Purr'
                    });

                    c.destroy()
                    vm.$root.$emit('hideActivityLogger')
                    return
                }

                // Reads all the files in a directory
                dir.paths(`${project.path}/build/`, (err, paths) => {

                    paths.dirs.forEach(dir => {

                        c.mkdir(dir.replace(`${project.path}/build/`, ''), true, err => {

                            console.log(err)
                        })
                    })

                    paths.files.forEach(file => {

                        const dest = file.replace(`${project.path}/build/`, '')

                        c.put(file, dest, err => {

                            console.log(err)
                            vm.$root.$emit('activityLogger', `uploading ${path.parse(file).base}`)
                        })
                    })

                    c.end()
                });
            })
        })

        c.on('error', err => {

            vm.$root.$emit('hideActivityLogger')

            c.destroy()

            notifier.notify({

                title: `Failed to FTP into ${project.name}`,
                message: err.message,
                group: 'statica', // only display one notification per app
                sound: 'Purr'
            });
        })

        // c.on('end', () => {

        //     vm.$root.$emit('hideActivityLogger')

        //     notifier.notify({

        //         title: `${project.name}`,
        //         message: 'Successfully deployed to FTP!',
        //         group: 'statica', // only display one notification per app
        //         sound: 'Purr'
        //     });
        // })

        c.on('close', hasErr => {

            console.log('closing with error' + hasErr)
            vm.$root.$emit('hideActivityLogger')

            // if(!hasErr) {

            //     notifier.notify({

            //         title: `${project.name}`,
            //         message: 'Successfully deployed to FTP!',
            //         group: 'statica', // only display one notification per app
            //         sound: 'Purr'
            //     });
            // }
        })

        vm.$root.$emit('activityLogger', `connecting..`)

        c.connect({
            host: service.server,
            port: 21,
            user: service.username,
            password: pass
        })
    }
}