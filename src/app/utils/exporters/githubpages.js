const notifier = require('node-notifier')
const ghpages = require('gh-pages')

const notify = (title, message, vm) => {

    notifier.notify({

        title,
        message,
        group: 'statica', // only display one notification per app
        sound: 'Purr'
    });
}

const githubpages = (project, service, pass, vm) => {

    const branch = service.branch.length ? service.branch : 'gh-pages'

    vm.$root.$emit('activityLogger', `Deploying to github repo..`)

    console.log(branch)

    if (project.repo) {

        // Rewrite the repo url so it uses username and password, like: https://user:pass@github.com/etc.
        const repo = project.repo.replace(/github\.com/i, `${service.username}:${pass}@github.com`)

        ghpages.publish(`${project.path}/build`, {

            branch,
            repo: repo

        }, (err) => {

            vm.$root.$emit('hideActivityLogger')

            if (err) {

                return notify(`Failed to push to Github: ${project.name}`, err.message, vm)
            }

            notify(`${project.name}`, 'Successfully deployed to Github Pages!')
        })
    }
}

module.exports = githubpages