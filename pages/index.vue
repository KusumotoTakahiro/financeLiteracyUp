<template>
  <v-row align-content="center" justify="center">
    <v-col cols="12" sm="12" md="12" lg="12" xl="12" align="center">
      <v-alert class="justify-center text-center text-h5"> 金融リテラシー </v-alert>
      <v-card
        class="
          d-flex 
          align-content-space-around 
          flex-wrap 
          justify-space-around 
          mt-15
          "
        flat
        tile
        :height="$vuetify.breakpoint.height-200"
      >
      <v-card
        to="/createUser"
        color=""
        outlined
        width="200"
        class="mx-15 mb-3"
        elevation="4"
        style="background-color: white;"
      >
        <v-card-text class="my-auto black--text text-h6">
          <v-row justify="center">
            新規ユーザ
          </v-row>
          <v-row justify="center" class="mt-10">
            <v-icon color="orange lighten-1" large>mdi-account-plus</v-icon>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card
        to="/login"
        color=""
        outlined
        width="200"
        class="mx-15 mb-3"
        elevation="4"
        style="background-color: white;"
      >
        <v-card-text class="my-auto black--text text-h6">
          <v-row justify="center">
            ログイン
          </v-row>
          <v-row justify="center" class="mt-10">
            <v-icon color="orange lighten-1" large>mdi-account-lock-open</v-icon>
          </v-row>
        </v-card-text>
      </v-card>
      </v-card>
    </v-col>
  </v-row>
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