<template>
  <v-app >
    <v-main>
      <my-title></my-title>
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
  data() {
    return {
      
    }
  },

}
</script>

<style scoped>

</style>
