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
            <div class="form-header">ユーザネーム</div>
            <v-text-field
              v-model="userName"
              clearable
              dense
              color=""
              outlined
              type="text"
              hide-details=""
              prepend-inner-icon="mdi-account"
            ></v-text-field>
            <div 
            class="form-header"
            v-if="attribute=='parent'"
            >メールアドレス</div>
            <v-text-field
              v-model="mailAddress"
              clearable
              dense
              color=""
              outlined
              type="email"
              hide-details=""
              prepend-inner-icon="mdi-email"
              v-if="attribute=='parent'"
            ></v-text-field>
            <div 
            class="form-header"
            v-if="attribute=='child'"
            >ユーザID</div>
            <v-text-field
              v-model="userID"
              clearable
              dense
              color=""
              outlined
              type="text"
              hide-details=""
              prepend-inner-icon="mdi-account-key"
              v-if="attribute=='child'"
            ></v-text-field>
            <div class="form-header">パスワード</div>
            <v-text-field
              v-model="password"
              clearable
              dense
              color=""
              :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPass ? 'text' : 'password'"
              prepend-inner-icon="mdi-key"
              outlined
              counter="20"
              @click:append="showPass = !showPass"
              @keyup.enter="login"
            ></v-text-field>
            <v-row justify="center">
              <v-radio-group
                v-model="attribute"
                row
              >
                <v-radio
                  label="親ロール"
                  value="parent"
                  class="mx-7"
                ></v-radio>
                <v-radio
                  label="子供ロール"
                  value="child"
                  class="mx-7"
                ></v-radio>
              </v-radio-group>
            </v-row>
            <v-btn
              class="black--text"
              block
              height="40"
              color=""
              @click="createUser()"
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
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import * as func from "~/plugins/myPlugins";
import {
  doc,
  setDoc,
} from "firebase/firestore";
import {
  fireStore,
} from "~/plugins/firebase";

export default {
  name: 'createUserPage',
  layout: "default",

  data() {
    return {
      dialog: true,
      userName: "",
      mailAddress: "",
      userID: "",
      password: "",
      showPass: false,
      initialized: false,
      errorMessage: [],
      attribute: "parent",
    }
  },
  computed: {
    isSignedIn() {
      return this.$store.getters.isSignedIn;
    },
  },
  mounted() {
    if (!this.initialized) {
      this.init();
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
    createUser(force = true) {
      //バリデーション
      if (!this.userName) {
        if (force) {
          this.$store.commit("addMessage", {
            text: `ユーザネームを入力してください`,
            risk: 3,
          });
        }
        return;
      }
      if (!this.mailAddress && this.attribute==='parent') {
        if (force) {
          this.$store.commit("addMessage", {
            text: `メールアドレスを入力してください`,
            risk: 3,
          });
        }
        return;
      }
      if (!this.userID && this.attribute==='child') {
        if (force) {
          this.$store.commit("addMessage", {
            text: `ユーザIDを入力してください`,
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
      if (!func.isMail(this.mailAddress) && this.attribute==='parent') {
        if (force) {
          this.$store.commit("addMessage", {
            text: `メールアドレスの形式が不正です`,
            risk: 3,
          });
        }
        return;
      }
      this.$store.commit("startTask");
      const auth = getAuth();
      
      //子どものときは，user@userid.comの仮メールアドレスで登録する
      if (this.attribute==='child') {
        this.mailAddress = 'user@' + this.userID + '.com';
      }

      createUserWithEmailAndPassword(
        auth,
        this.mailAddress,
        this.password
      )
      .then((userCredential)=>{
        const user = userCredential.user;
        console.log(user);
        setDoc(doc(fireStore, "users", user.uid), {
          attribute: this.attribute,
          balance: 1000,
          group: null,
          history: [],
        })
        this.$store.commit("addMessage", {
          text: "ユーザを作成しました!",
          risk: 0,
        });
        try {
          updateProfile(auth.currentUser, {
            displayName: this.userName,
          })
        }
        catch(error) {
          console.log(error);
        }
        this.$store.commit("setTitle", {title:"グループ選択"});
        this.$router.push('select');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this.$store.commit("addMessage", {
          text: `ユーザ作成に失敗しました:エラーコード[${errorCode}], ${errorMessage}`,
          risk: 3,
        })
        this.$store.commit("setTitle", {title:"金融リテラシーを高める!"});
        this.$router.push('/');
      });
      
    },

  }
}
</script>
<style>
.title {
  text-align: center;
  position: fixed; /* ウィンドウを基準に画面に固定 */
  top: 20px;
  width:500px;
  left: calc(50% - 250px);
}
</style>