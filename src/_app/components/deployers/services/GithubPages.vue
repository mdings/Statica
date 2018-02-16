<template id="github">
    <div>
        <!-- <div v-if="obj.type">
            <label>Service</label>
            <span>{{obj.type}}</span>
        </div> -->

        <label>Title</label>
        <input required
            type="text"
            name="title"
            placeholder="title"
            v-model="obj.title"
            @keyup="checkValidity">

        <label>Branch</label>
        <input
            type="text"
            name="branch"
            v-model="obj.branch"
            placeholder="gh-pages">

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
