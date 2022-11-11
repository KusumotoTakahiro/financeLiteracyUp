<template>
  <v-row align-content="center" justify="center">
    <v-col cols="12" sm="12" md="12" lg="12" xl="12" align="center">
      <v-alert class="justify-center text-center text-h4"> 
        現在は未実装です．
      </v-alert>
      <v-card
        class="
          d-flex 
          align-content-space-around 
          flex-wrap 
          justify-space-around
          mt-5
          "
        flat
        tile
        :height="$vuetify.breakpoint.height-200"
      >
        <v-card>
        メッセージ機能
        </v-card>
        <v-card>
        子どもの初期金額指定
        </v-card>
        <v-card>
        メンバー管理
        </v-card> が実装予定です
      </v-card>
      <v-btn
        class="mx-auto mt-15"
        height="40"
        width="150"
        color=""
        @click="goToHome()"
      >Homeに戻る</v-btn>
    </v-col>
  </v-row>
</template>
<script>


export default {
  data() {
    return {

    }
  },
  methods: {
    goToHome(){
      this.$router.push('/room');
    }
  }
}
</script>
<style>

</style>
