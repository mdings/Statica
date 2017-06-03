const ftp = require('easy-ftp')

module.exports = {

    ftp(project, service) {

        const deployer = new ftp()

        deployer.connect({

            username: service.username,
            password: 'kxdfkJmH29',
            host: service.host,
            port: service.port,
        })


        deployer.upload(project.path + '/build/**/*', '/www/statica/', e => {

            if (e) {

                console.log(e)
            }

            deployer.close()
        })
        //@TODO: check for the localroot to exist
    }
}