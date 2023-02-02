<template>
  <v-app >
    <v-main>
      <!-- <my-title></my-title> -->
      <nuxt></nuxt>
      <my-alert></my-alert>
    </v-main>
  </v-app>
</template>

<script>
import MyAlert from '~/components/MyAlert.vue'
import MyTitle from '~/components/MyTitle.vue'
export default {
  beforeCreate() {
    console.log("default beforeCreate");
  },
  components: { MyAlert, MyTitle },
  name: 'DefaultLayout',
  head() {
    return {
      link: [
        {
          rel: "stylesheet",
          href: "https://bossanova.uk/jspreadsheet/v4/jexcel.css",
        },
        {
          rel: "stylesheet",
          href: "https://jsuites.net/v4/jsuites.css"
        }
      ],
      script: [
        { src: "https://bossanova.uk/jspreadsheet/v4/jexcel.js" },
        { src: "https://jsuites.net/v4/jsuites.js" }
      ]
    }
  },
  data() {
    return {
      
    }
  },

}
</script>

<style scoped>

</style>
