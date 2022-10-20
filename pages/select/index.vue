<template>
  <v-container fill-height>
    <v-row justify="center" >
      <v-btn 
        @click="createGroup()"
        elevation="3"
        width="200px"
        height="70px"
        class="mx-auto"
      >新規グループ作成</v-btn>
      <v-btn 
        @click="goToGroup()" 
        elevation="3"
        width="200px"
        height="70px"
        class="mx-auto"
      >既存グループに入る</v-btn>
    </v-row>
  </v-container>
</template>
<script>
import { getAuth} from 'firebase/auth'
import { authStateChanged } from '@/plugins/auth'
import { fireStore } from '@/plugins/firebase'
import { 
  collection, 
  getDocs,
  getDoc, 
  doc,  
} from 'firebase/firestore'

export default {
  data() {
    return {
      isLogin: false,
    }
  },
  async mounted() {
    // firebase authenticationから現在ログインしているユーザの状態を取る
    let user = await authStateChanged();
    if (user.uid) {
      this.isLogin = true;
    }
    else {
      this.$store.commit("addMessage", {
        text: "ログインしてください",
        risk: 3,
      })
      this.$router.push('/');
    }
  },
  methods: {
    createGroup() {
      this.$store.commit("setTitle", {title:"新規グループ作成"});
      this.$router.push("/select/createGroup");
    },
    goToGroup() {
      this.$store.commit("setTitle", {title:""});
      this.$router.push("/select/joinGroup");
    }
  }
}
</script>
<style scoped>

</style>