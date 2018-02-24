const notifier = require('node-notifier')
const dir = require('node-dir')
const path = require('upath')

let vue

class FTP {

    constructor(actions, service, project, password) {
        const Client = require('ftp')
        this.client = new Client()
        this.actions = actions
        this.credentials = service
        this.project = project
        this.credentials.password = password

        console.log(this.credentials, this.project)
        this.client.on('ready', this.ready.bind(this))
        this.client.on('error', this.error.bind(this))
    }

    run() {
        this.connect(this.credentials)
    }

    async ready() {
        try {
            const homedir = this.credentials.homedir || '/'
            await this.changeDirectory(homedir)
            const paths = await this.readDirectory()
            await this.createDirectories(paths.dirs)
            await this.uploadFiles(paths.files)
            this.notify(this.credentials.title, 'Successfully deployed to FTP!')
        } catch (err) {
            this.notify(err.title, err.message)
        }
    }

    changeDirectory(dir) {
        return new Promise((resolve, reject) => {
            this.client.cwd(dir, err => {
                if (err) {
                    const title = `Failed to FTP into ${this.credentials.title}`
                    const message = err.message
                    return reject({title, message})
                }
                resolve()
            })
        })
    }

    readDirectory() {
        return new Promise((resolve, reject) => {
            dir.paths(`${this.project.path}/build/`, (err, paths) => {
                if (err) {
                    const title = `FTP failed for ${this.credentials.title}`
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
                this.client.mkdir(dir.replace(`${this.project.path}/build/`, ''), true, err => {
                    if (err) {
                        const title = `FTP failed for ${this.credentials.title}`
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
                const dest = file.replace(`${this.project.path}/build/`, '')
                this.client.put(file, dest, err => {
                    if (err) {
                        const title = `FTP failed for ${this.credentials.title}`
                        const message = err.message
                        return reject({title, message})
                    }
                    this.actions.showActivity(`Uploading ${path.parse(file).base}`)
                    resolve()
                })
            })
        })
        return Promise.all(filesToPut)
    }

    error(err) {
        this.notify(`Failed to FTP into ${this.credentials.title}`, err.message)
    }

    notify(title, message) {
        this.actions.hideActivity()
        notifier.notify({
            title,
            message,
            group: 'statica', // only display one notification per app
            sound: 'Purr'
        })
        this.client.destroy()
    }

    connect({host, username, password}) {
        this.actions.showActivity('Connecting to FTP..')
        console.log(host, username, password)
        this.client.connect({
            host: host,
            port: 21,
            user: username,
            password: password
        })
    }
}

export default FTP
