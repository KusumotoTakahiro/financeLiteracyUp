<template>
  <v-container>
    <h3
      style="color:black; text-align:center"
    >ログイン</h3>
    <v-text-field
      v-model="mailAddress" 
      label="メールアドレス" 
      light
    ></v-text-field>
    <v-text-field
      v-model="password"
      label="パスワード"
      light
    ></v-text-field>
    <p 
      class="errorMessage" 
      style="color: red"
      v-if="valid"
    >{{validError}}</p>
    <v-btn
      @click="login()"
    >ログイン</v-btn>
  </v-container>
</template>

<script>
import {
  browserSessionPersistence,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
export default {
  name: 'IndexPage',
  data() {
    return {
      mailAddress: '',
      password: '',
      valid: false,
      validError: "UserIDまたはPassWordが間違っています"
    }
  },
  methods: {
    login() {
      this.$store.commit("startLogin");
      this.$store.commit("startTask");
      const auth = getAuth();
      console.log(auth);
      setPersistence(auth, browserSessionPersistence)
        .then(async () => {
          try {
            await signInWithEmailAndPassword(
              auth, 
              this.mailAddress,
              this.password
            );
            this.$store.commit("addMessage", {
              text: "ログインしました",
              risk: 0,
            });
            this.$router.push("/top");
          } catch(error) {
            console.log(error);
          }
        })
    },
  }
}
</script>
