<template>
  <v-dialog
    v-model="dialog"
    max-width="450"
    persistent
    hide-overlay
    no-click-animation
    content-class="rounded-lg elevation-0"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-text>
        <div class="d-flex justify-center pa-5">
          <!-- <v-img max-width="250" :src="logoImage" class="justify-center" /> -->
        </div>
        <template>
          <div>
            <div class="form-header">グループネーム</div>
            <v-text-field
              v-model="groupName"
              clearable
              dense
              color=""
              outlined
              type="text"
              hide-details=""
              prepend-inner-icon="mdi-account-group"
            ></v-text-field>
            <div class="form-header">パスワード</div>
            <v-text-field
              v-model="password"
              clearable
              dense
              class="input_case"
              :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPass ? 'text' : 'password'"
              prepend-inner-icon="mdi-key"
              outlined
              counter="20"
              @click:append="showPass = !showPass"
              @keyup.enter="login"
            ></v-text-field>
            <v-btn
              class="black--text"
              block
              height="40"
              color=""
              @click="createGroup()"
            >登録</v-btn>
          </div> 
        </template>
        <v-row justify="end">
          <v-btn
            class="black--text mt-15 "
            height="40"
            color=""
            @click="goToHome()"
          >Homeに戻る</v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
import { getAuth } from "firebase/auth";
import * as func from "~/plugins/myPlugins";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import {
  fireStore,
} from "~/plugins/firebase";
import {authStateChanged} from '@/plugins/auth'

export default {
  name: 'createUserPage',
  layout: "default",

  data() {
    return {
      dialog: true,
      groupName: "",
      password: "",
      showPass: false,
      initialized: false,
      errorMessage: [],
    }
  },
  computed: {
    isSignedIn() {
      return this.$store.getters.isSignedIn;
    },
  },
  async mounted() {
    let user = await authStateChanged();
    if (user.uid) {
      this.isLogin = true;
      try {
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
      }
      catch(error) {
        console.log(error);
      }
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
    init() {
      this.initialized = true;
    },
    goToHome() {
      this.$store.commit("setTitle", {title:"金融リテラシーを高める!"});
      this.$router.push(`/`);
    },
    async createGroup(force = true) {
      //バリデーション
      if (!this.groupName) {
        if (force) {
          this.$store.commit("addMessage", {
            text: `グループネームを入力してください`,
            risk: 3,
          });
        }
        return;
      }
      if (!this.password) {
        if (force) {
          this.$store.commit("addMessage", {
            text: `パスワードを入力してください`,
            risk: 3,
          });
        }
        return;
      }
      let roomObj = {};
      roomObj.name = this.groupName;
      roomObj.password = this.password;
      roomObj.roomId = this.randomStr();
      const roomRef = doc(fireStore, "groups", roomObj.roomId);
      const memberCollRef = collection(fireStore, "groups", roomObj.roomId, "member");
      await setDoc(roomRef, roomObj);
      let user = await authStateChanged();
      if (user.uid) {
        try {
          await setDoc(doc(memberCollRef), {
            name: user.displayName,
            uid: user.uid,
            attribute: "parent",
          })
          await updateDoc(doc(fireStore, "users", user.uid), {
            group: roomObj.roomId,
          })
          .then(()=> {
            this.$store.commit("setTitle", {title:""});
            this.$router.push(`/room`);
          })
        }
        catch(error) {
          console.log(error);
        }
      }

    },
    randomStr() {
      let l = 24;
      let c = 'abcdefghijklmnopqrstuvwxyz0123456789'

      let cl = c.length;
      let r = ''
      for (let i = 0; i < l; i++) {
        r += c[Math.floor(Math.random()*cl)]
      }
      return r
    },

  }
}
</script>
<style>
.input_case {
  font-family: serif;
  font-size: 0.7rem;
}
</style>