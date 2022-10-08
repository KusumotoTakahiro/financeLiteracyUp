<template>
  <v-container fill-height>
    <v-row justify="center" >
      <v-btn 
        @click="createUser()"
        elevation="3"
        width="150px"
        height="70px"
        class="mx-auto"
      >新規ユーザ</v-btn>
      <v-btn 
        @click="goToLogin()" 
        elevation="3"
        width="150px"
        height="70px"
        class="mx-auto"
      >ログイン</v-btn>
    </v-row>
  </v-container>
</template>
<script>
export default {
  head: {
    link: [
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap',
      },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap',
      },
    ],
  },
  name: 'IndexPage',
  layout: "default",
  data() {
    return {

    }
  },
  computed: {
  },
  methods: {
    goToLogin() {
      this.$store.commit("setTitle", {title:"ログイン画面"});
      this.$router.push("/login");
    },
    createUser() {
      this.$store.commit("setTitle", {title:"新規ユーザ登録"});
      this.$router.push("/createUser");
    }
  }
}
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap');

</style>