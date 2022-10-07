<template>
  <v-app >
    <v-main>
      <v-containter>
        <nuxt/>
      </v-containter>
      <my-alert></my-alert>
    </v-main>
  </v-app>
</template>

<script>
import MyAlert from '~/components/MyAlert.vue'
export default {
  components: { MyAlert },
  name: 'DefaultLayout',
  data() {
    return {
      
    }
  },
}
</script>

<style scoped>

</style>
