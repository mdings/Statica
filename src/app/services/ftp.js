const notifier = require('node-notifier')
const dir = require('node-dir')
const path = require('upath')

let vue

class FTP {

    constructor() {
        const Client = require('ftp')
        this.client = new Client()
        this.credentials = {}
        this.client.on('ready', this.ready.bind(this))
        this.client.on('error', this.error.bind(this))
    }

    async ready() {
        try {
            const homedir = this.credentials.service.homedir || '/'
            await this.changeDirectory(homedir)
            const paths = await this.readDirectory()
            await this.createDirectories(paths.dirs)
            await this.uploadFiles(paths.files)
            this.notify(this.credentials.project.name, 'Successfully deployed to FTP!')
        } catch (err) {
            this.notify(err.title, err.message)
        }
    }

    changeDirectory(dir) {
        return new Promise((resolve, reject) => {
            this.client.cwd(dir, err => {
                if (err) {
                    const title = `Failed to FTP into ${this.credentials.project.name}`
                    const message = err.message
                    return reject({title, message})
                }
                resolve()
            })
        })
    }

    readDirectory() {
        return new Promise((resolve, reject) => {
            dir.paths(`${this.credentials.project.path}/build/`, (err, paths) => {
                if (err) {
                    const title = `FTP failed for ${this.credentials.project.name}`
                    const message = err.message
                    return reject({title, message})
                }
                resolve(paths)
            })
        })
    }

    createDirectories(dirs) {
        const dirsToCreate = dirs.map(dir => {
            return new Promise((resolve, reject) => {
                this.client.mkdir(dir.replace(`${this.credentials.project.path}/build/`, ''), true, err => {
                    if (err) {
                        const title = `FTP failed for ${this.credentials.project.name}`
                        const message = err.message
                        return reject({title, message})
                    }
                    resolve()
                })
            })
        })
        return Promise.all(dirsToCreate)
    }

    uploadFiles(files) {
        const filesToPut = files.map(file => {
            return new Promise((resolve, reject) => {
                const dest = file.replace(`${this.credentials.project.path}/build/`, '')
                this.client.put(file, dest, err => {
                    if (err) {
                        const title = `FTP failed for ${this.credentials.project.name}`
                        const message = err.message
                        return reject({title, message})
                    }
                    vue.$root.$emit('activityLogger', `Uploading ${path.parse(file).base}`)
                    resolve()
                })
            })
        })
        return Promise.all(filesToPut)
    }

    error(err) {
        this.notify(`Failed to FTP into ${this.credentials.project.name}`, err.message)
    }

    notify(title, message) {
        vue.$root.$emit('hideActivityLogger')
        notifier.notify({
            title,
            message,
            group: 'statica', // only display one notification per app
            sound: 'Purr'
        })
        this.client.destroy()
    }

    connect(project, service, pass, vm) {
        // Update the credentials to the project that we're connecting to
        // @TODO: look into destructuring
        this.credentials.project = project
        this.credentials.service = service
        this.credentials.pass = pass
        vue = vm

        vue.$root.$emit('activityLogger', `Connecting..`)

        this.client.connect({
            host: service.server,
            port: 21,
            user: service.username,
            password: pass
        })
    }
}

const ftp = new FTP()

export default ftp
// Explicitly bind to ftp object!
// module.exports = ftp.connect.bind(ftp)
