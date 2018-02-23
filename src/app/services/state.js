const exportNames = {
    'FTP': 'FTP',
    'GithubPages': 'Github Pages'
}

const inputModes = {
    0: 'add',
    1: 'edit'
}

export const state = {
    items: [],
    active: null,
    fields: {},
    inputModes: inputModes,
    inputMode: inputModes[0],
    project: null,
    type: null,
    isPaneActive: false,
    isButtonDisabled: true,
    isActivity: null,
}