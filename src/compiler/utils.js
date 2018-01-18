const { app } = require('electron').remote
const NotificationCenter = require('node-notifier').NotificationCenter

// Use our own build of the notifier: https://github.com/mikaelbr/node-notifier/issues/71
const notifier = new NotificationCenter({
    withFallback: false,
    customPath: `${app.getAppPath()}/notifier/Contents/MacOS/Statica`
})

module.exports = {
    notify(title, subtitle, message) {
        console.log(`${app.getAppPath()}/Statica`)
        notifier.notify({
            title,
            subtitle,
            message,
            group: 'statica', // only display one notification per app
            sound: 'Submarine',
            timeout: 10000,
        })
    },

    /*
    Message examples:
    - 'underscore' is imported by ../../_app.vue, but could not be resolved - treating it is an external dependency.
    - Could not resolve ../module from ../../app.vue
    */
    findRelativePath(message) {
        const relativeFilename = /(?:(from|by)\s)(\.\.\/+[a-zA-z/._0-9]*)/gi.exec(message)
        return (relativeFilename && relativeFilename[0]) ? relativeFilename[0] : null
    }
}