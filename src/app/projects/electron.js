const remote = require('electron').remote
const { dialog } = remote

export const openDialog = actions => {
    const currentWindow = remote.getCurrentWindow()
    dialog.showOpenDialog(currentWindow, {
        properties: ['openDirectory'],
    }, filePaths => {
        if (filePaths) {
            // @todo: add the project to the state
            console.log(filePaths, actions)
        }
    })
}