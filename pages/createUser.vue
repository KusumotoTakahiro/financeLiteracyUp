<template>
  <v-dialog
    v-model="dialog"
    max-width="450"
    persistent
    hide-overlay
    no-click-animation
    content-class="rounded-lg elevation-3"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-alert 
        class="
          justify-center 
          text-center 
          text-h6"
      > ユーザ登録</v-alert>
      <div 
        v-if="attribute=='child'"
        class="
          justify-center 
          text-center 
          red--text
          mt-n3
          original-font-size
          "
        >子供ロールではパスワードが再発行できません。<br>
        必ず忘れないようにしてください．</div>
      <v-card-text>
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
              class="input_case"
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
              class="input_case"
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
              class="input_case"
              v-if="attribute=='child'"
            ></v-text-field>
            <div class="form-header">パスワード</div>
            <v-text-field
              v-model="password"
              class="input_case"
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
            <v-row align="center" justify="space-around">
              <v-btn
                class="black--text"
                height="40"
                @click="createUser()"
              >　登 録　</v-btn>
              <v-btn
                class="black--text"
                height="40"
                @click="goToHome()"
              >Homeに戻る</v-btn>
            </v-row>
          </div> 
        </template>
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
      if (!func.isHalf(this.userID) && this.attribute==='child') {
        if (force) {
          this.$store.commit("addMessage", {
            text: `ユーザIDは半角英数字で記入してください`,
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
          name: this.userName,
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
        if (this.attribute==="parent") {
          this.$store.commit("setTitle", {title:"グループ作成"});
          this.$router.push('createGroup');
        }
        else {
          this.$store.commit("setTitle", {title:"グループ参加"});
          this.$router.push('joinGroup');
        }
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
.original-font-size {
  font-size: 0.6rem;
}
.input_case {
  font-family: serif;
  font-size: 0.7rem;
}
</style>