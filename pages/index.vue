<template>
  <v-container fill-height>
    <div class="title">金融リテラシーを高める!</div>
    <v-row justify="center" >
      <v-btn 
        @click="$router.push(`/createUser`)"
        elevation="3"
        width="150px"
        height="70px"
        class="mx-auto"
      >新規ユーザ</v-btn>
      <v-btn 
        @click="$router.push(`/login`)" 
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
  methods: {
    goToLogin() {
      this.$router.push("/login");
    },
    createUser() {
      this.router.push("/createUser");
    }
  }
}
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap');
.title {
  text-align: center;
  position: fixed; /* ウィンドウを基準に画面に固定 */
  top: 20px;
  width:500px;
  left: calc(50% - 250px);
  font-size: 50px;
}
</style>