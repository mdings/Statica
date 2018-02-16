<template id="ftp">
    <div>




        <label>Title</label>
        <input required
            type="text"
            name="title"
            placeholder="title"
            v-model="obj.title"
            @keyup="checkValidity">

        <label>Server</label>
        <input required
            type="text"
            name="host"
            placeholder="ftp.domain.com"
            v-model="obj.server"
            @keyup="checkValidity">

        <label>Port (Optional)</label>
        <input type="text" name="port" placeholder="80" v-model="obj.port">

        <label>Homedir (Optional)</label>
        <input type="text" name="homedir" placeholder="/" v-model="obj.homedir">

        <label>Username</label>
        <input required
            type="text"
            name="username"
            v-model="obj.username"
            @keyup="checkValidity">

        <label>Password</label>
        <input required
            type="password"
            name="password"
            v-model="obj.password"
            @keyup="checkValidity">

    </div>
</template>

<script>

    const forms = require('../../../utils/forms')

    export default {

        mixins: [forms]
    }
</script>