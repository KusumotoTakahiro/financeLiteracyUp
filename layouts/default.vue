<template>
  <v-app :style="{ background: $vuetify.theme.themes.light[back] }">
    <v-content>
      <v-containter>
        <nuxt/>
      </v-containter>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      
    }
  },
}
</script>
