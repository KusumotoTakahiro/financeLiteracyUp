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
          <div v-if="isLogin && !isSignedIn" class="d-flex justify-center pa-5">
            <!-- <v-img max-width="250" :src="logoImage" class="justify-center" /> -->
          </div>
          <template v-if="isLogin && !isSignedIn">
            <template v-if="lateShow && loginType === 'email'">
              <div v-if="!isSignedIn">
                <div class="form-header">メールアドレス</div>
                <v-text-field
                  v-model="mailAddress"
                  clearable
                  dense
                  color=""
                  outlined
                  type="email"
                  hide-details=""
                  prepend-inner-icon="mdi-email"
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
                <v-btn
                  class="black--text"
                  block
                  height="40"
                  color=""
                  @click="login"
                >ログイン</v-btn>
              </div>
            </template> 
            <div class="pt-3">
              <v-btn
                text
                block
                @click="
                  isMissingPass = true;
                  isLogin = false;
                "
              > パスワードを忘れた場合 </v-btn>
            </div>
          </template>
          <template v-else-if="isMissingPass && !isSignedIn">
            <v-card-title class="px-0 black--text">
              パスワード更新
            </v-card-title>
            <div class="pb-2 black--text">
              パスワード更新後は過去のパスワードは使用できません
            </div>
            <div class="form-header">メールアドレス</div>
            <v-text-field
              v-model="mailAddress"
              clearable
              dense
              hide-details=""
              color=""
              outlined
              type="email"
              prepend-inner-icon="mdi-email"
            ></v-text-field>
            <div class="pt-3">
              <v-btn
                color=""
                class="black--text"
                block
                height="40"
                @click="sendPassResetMail"
              >パスワード再設定メール送信</v-btn>
            </div>
            <div class="pt-3">
              <v-btn
                text
                block
                @click="
                  isMissingPass = false;
                  isLogin = true;
                ">ログイン画面に戻る</v-btn>
            </div>
          </template>
          <v-row justify="end">
            <v-btn
              class="black--text mt-15 "
              height="40"
              color=""
              @click="$router.push(`/`);"
            >Homeに戻る</v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
import {
  browserSessionPersistence,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import * as func from "~/plugins/myPlugins";

export default {
  name: 'LoginPage',
  layout: "default",
  
  data() {
    return {
      dialog: true,
      lateShow: true,
      loginType: "email",
      mailAddress: '',
      password: '',
      isMissingPass: false,
      isLogin: true,
      showPass: false,
      initialized: false,

      errorCodes: {
        "auth/email-already-in-use": {
          message: "メールアドレスは既に使用されています",
        },
        "auth/invalid-email": {
          message: "メールアドレスの形式が不正です",
        },
        "auth/popup-blocked": {
          message: "ポップアップが拒否されました，設定を変更してください",
        },
        "auth/unauthorized-domain": {
          message: "現在この認証方法はご利用頂けません",
        },
        "auth/requires-recent-login": {
          message: "認証の有効期限が切れています",
        },
        "auth/weak-password": {
          message: "パスワードが脆弱です,6文字以上で単純でないものにしてください",
        },
        "auth/wrong-password": {
          message: "メールアドレスまたはパスワードが違います",
        },
        "auth/user-not-found": {
          message: "メールアドレスまたはパスワードが違います",
        },
        "auth/user-disabled": {
          message: "不正な操作等の検知により，サービスの利用が停止されています",
        },
        "auth/account-exists-with-different-credential": {
          message: "別のログイン方式で登録されております，他のログイン方式で実行してください",
        },
      }
    }
  },
  computed: {
    // user: function() {
    //   return this.$store.getters.user;
    // },
    isSignedIn() {
      return this.$store.getters.isSignedIn;
    },
    // title: function () {
    //   return this.$store.getters.get.title;
    // },
    // apiRoot: function () {
    //   return this.$store.getters.get.apiRoot;
    // },
    // organization: function () {
    //   return this.$store.getters.organization;
    // },
    // signUp: function () {
    //   return this.$store.getters.get.signUp;
    // },
    // logoImage: function () {
    //   return this.$store.getters.logoImage;
    // },
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
    login(force = true) {
      if (!this.mailAddress || !this.password) {
        if (force) {
          this.$store.commit("addMessage", {
            text: `メールアドレス，パスワードを入力してください`,
            risk: 3,
          });
        }
        return;
      }
      if (!func.isMail(this.mailAddress)) {
        if (force) {
          this.$store.commit("addMessage", {
            text: `メールアドレスの形式が不正です`,
            risk: 3,
          });
        }
        return;
      }
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
            const errorCode = error.code;
            let errorMessage = error.message;
            if (this.errorCodes[errorCode]) {
              errorMessage = this.errorCodes[errorCode].message;
            }
            this.$store.commit("completeTask");
            this.$store.commit("completeLogin");
            this.$store.commit("addMessage", {
              text: `ログインに失敗しました:エラーコード[${errorCode}], ${errorMessage}`,
            });
          }
        }).catch ((error)=> {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(`${errorCode}:${errorMessage}`);
          this.$store.commit("completeTask");
          this.$store.commit("completeLogin");
        });
    },
    sendPassResetMail() {
      if (!this.mailAddress) {
        this.$store.commit("addMessage", {
          text: `アカウントのメールアドレスを入力してください`,
        });
        return;
      }
      if (!func.isMail(this.mailAddress)) {
        this.$store.commit("addMessage", {
          text: '正しいメールアドレスを入力してください',
        });
        return;
      }
      const auth = getAuth();
      sendPasswordResetEmail(auth, this.mailAddress)
        .then(() => {
          this.$store.commit("addMessage", {
            text: `「${this.mailAddress}」に再設定メールを送信しました，届かない場合は迷惑フォルダをご確認ください`,
            risk: 0,
            dismissible: true,
          });
          this.mailAddress = "";
          this.isMissingPass = false;
          this.isLogin = true;
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          this.$store.commit("addMessage", {
            text: `メール送信に失敗しました:エラーコード[${errorCode}],${errorMessage}`,
            dismissible: true,
          });
        });
    },
    sendVerify(user = null) {
      if (!user) {
        const auth = getAuth();
        user = auth.currentUser;
      }
      sendEmailVerification(user).then(()=> {
        this.$store.commit("addMessage", {
          text: `確認メールを送信しました，届かない場合は迷惑フォルダをご確認ください`,
          risk: 0,
          dismissible: true,
        });
      });
    },
  },
}
</script>
<style scoped>
.form-header {
  color: #000;
  font-size: 0.8rem;
  text-align: left;
}
.require {
  color: red;
}
</style>