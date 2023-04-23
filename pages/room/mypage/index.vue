<template>
  <v-row align-content="center" justify="center" class="bg-yellow">
    <v-col cols="12" sm="12" md="12" lg="12" xl="12" >
      <v-card
        class="
					d-flex
          justify-center
					mx-auto
        "
        elevation="10"
        :width="$vuetify.breakpoint.width-50"
      >
        <div class="header">
          <v-alert 
            class="
              text-center 
              text-h6
              my-0
              bg-grad
              lime--text
              text-ligten-3
              "
            border="bottom"
						colored-border
						color="blue accent-5"
						elevation="2"> マイページ
          </v-alert>
        </div>
        <div class="main mb-10 mt-10">
          <div>
            <div class="form-header text-center mt-5">ルーム名の変更</div>
            <v-text-field
              v-model="temprName"
              clearable
              placeholder="新しいルーム名を入力してください"
              dense
              outlined
              type="text"
              hide-details=""
              class="input_case mx-2"
            ></v-text-field>
            <div
              class="red--text text--lighten-1 text-center mb-0"
              style="font-size: 0.5rem"
            >
              ここで変更したルーム名はこのアカウントのみに反映されます
            </div>
            <v-row 
              class="mt-0 mb-3 mx-auto"
              align-content="center"
              justify="space-around"
            >
              <v-btn
                class="black--text mt-5"
                height="40"
                width="150"
                color=""
                @click="check_rname()"
              > 変 更 </v-btn>
              <v-btn
                class="black--text mt-5"
                height="40"
                width="150"
                color=""
                @click="reget_rname()"
              > 元に戻す </v-btn>
            </v-row>
          </div>
          <!-- dividerにwidthを付けると変にレイアウトが崩れない -->
          <!-- <v-divider  ></v-divider>
          <div>
            <div class="form-header text-center mt-5">ユーザ名の変更</div>
            <v-text-field
              v-model="tempUserName"
              clearable
              placeholder="新しいユーザ名を入力してください"
              dense
              outlined
              type="text"
              hide-details=""
              class="input_case mx-2"
            ></v-text-field>
            <div
              class="red--text text--lighten-1 text-center mb-0"
              style="font-size: 0.5rem"
            >
              ここで変更したユーザ名はルーム全体に反映されます
            </div>
            <v-row 
              class="mt-0 mb-3 mx-auto"
              align-content="center"
              justify="space-around"
            >
              <v-btn
                class="black--text mt-5"
                height="40"
                width="150"
                color=""
                @click="check_uname()"
              > 変 更 </v-btn>
              <v-btn
                class="black--text mt-5"
                height="40"
                width="150"
                color=""
                @click="reget_uname()"
              > 元に戻す </v-btn>
            </v-row>
          </div> -->
          <!-- dividerにwidthを付けると変にレイアウトが崩れない -->
          <v-divider ></v-divider>
          <!-- 壁紙設定 -->
          <div>
            <div class="form-header text-center mt-5">壁紙の変更(今後実装予定)</div>
            <v-radio-group 
              row 
              v-model="mycolor"
            >
              <v-radio 
                v-for="item in colors"
                :key="item.id"
                :value="item.id"
                :color="item.color"
                :label="item.color"
              >
              
              </v-radio>
            </v-radio-group>
            <div
              class="red--text text--lighten-1 text-center mb-0"
              style="font-size: 0.5rem"
            >
              ここで変更した壁紙はこのアカウントのみに反映されます
            </div>
            <v-row 
              class="mt-0 mb-3 mx-auto"
              align-content="center"
              justify="space-around"
            >
              <v-btn
                class="black--text mt-5"
                height="40"
                width="150"
                color=""
                @click="change_bg()"
              > 変 更 </v-btn>
              <v-btn
                class="black--text mt-5"
                height="40"
                width="150"
                color=""
                @click="reget_bg()"
              > 元に戻す </v-btn>
            </v-row>
          </div>
          <!-- dividerにwidthを付けると変にレイアウトが崩れない -->
          <v-divider  ></v-divider>
          <v-row 
          class="mt-5 mb-5 mx-auto"
          align-content="center"
          justify="center"
          >
            <v-btn width="200px" @click="check_logout()">ログアウト</v-btn>
          </v-row>
          <!-- dividerにwidthを付けると変にレイアウトが崩れない -->
          <v-divider  ></v-divider>
          <v-row
            class="mt-5 mb-10 mx-auto"
            align-content="center"
            justify="center"
          >
            <v-btn width="200px" class="mx-auto mb-1" @click="goToHome()">
              Homeに戻る
            </v-btn>
          </v-row>
        </div>
        <v-dialog
          v-model="rname_dialog"
          outlined
          hide-overlay
          max-width="600"
          content-class="rounded-lg elevation-2"
          transition="dialog-bottom-transition"
        >
          <v-card>
            <v-card-title class="justify-center">
              ルーム名変更
            </v-card-title>
            <v-card-text class="text-center">
              {{temprName}}を新しいルーム名にします
            </v-card-text>
            <v-card-actions>
              <v-row
                class="mt-3 mb-3 mx-auto"
                align-content="center"
                justify="center"
              >
                <v-btn width="200px" class="mx-auto mb-1" @click="change_rname()">
                  Ok
                </v-btn>
                <v-btn width="200px" class="mx-auto mb-1" @click="rname_dialog=false">
                  Close
                </v-btn>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="uname_dialog"
          outlined
          hide-overlay
          max-width="600"
          content-class="rounded-lg elevation-2"
          transition="dialog-bottom-transition"
        >
          <v-card>
            <v-card-title class="justify-center">
              ユーザ名変更
            </v-card-title>
            <v-card-text class="text-center">
              {{tempUserName}}を新しいユーザ名にします
            </v-card-text>
            <v-card-actions>
              <v-row
                class="mt-3 mb-3 mx-auto"
                align-content="center"
                justify="center"
              >
                <v-btn width="200px" class="mx-auto mb-1" @click="change_uname()">
                  Ok
                </v-btn>
                <v-btn width="200px" class="mx-auto mb-1" @click="uname_dialog=false">
                  Close
                </v-btn>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="logout_dialog"
          outlined
          hide-overlay
          max-width="600"
          content-class="rounded-lg elevation-2"
          transition="dialog-bottom-transition"
        >
          <v-card>
            <v-card-title class="justify-center">
              ログアウト
            </v-card-title>
            <v-card-text class="text-center">
              ログアウトします．よろしいですか？
            </v-card-text>
            <v-card-actions>
              <v-row
                class="mt-3 mb-3 mx-auto"
                align-content="center"
                justify="center"
              >
                <v-btn width="200px" class="mx-auto mb-1" @click="logout()">
                  Ok
                </v-btn>
                <v-btn width="200px" class="mx-auto mb-1" @click="logout_dialog=false">
                  Close
                </v-btn>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import { getAuth, updateProfile } from "firebase/auth";
import * as func from "~/plugins/myPlugins";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  fireStore,
} from "~/plugins/firebase";
import {
  authStateChanged,
  saveHistory,
  userLogout
} from '@/plugins/auth'

export default ({
  name: 'myPage',
  layout: "default",

  data() {
    return {
      roomName: "",
      temprName: "",
      rname_dialog: false,

      isLogin: false,
      logout_dialog: false,
      roomPath: null,

      user: null,
      userRef: null,
      userName: "",
      tempUserName: "", //一時的にデータを保存しておく
      uname_dialog: false,

      mycolor: 1,
      colors: [
        {
          id:1,
          color: 'primary',
          label: '',
          value: '',
        },
        {
          id:2,
          color: 'secondary',
          label: '',
          value: '',
        },
        {
          id:3,
          color: 'success',
          label: '',
          value: '',
        },
        {
          id:4,
          color: 'info',
          label: '',
          value: '',
        },
        {
          id:5,
          color: 'warning',
          label: '',
          value: '',
        },
        {
          id:6,
          color: 'error',
          label: '',
          value: '',
        },
        
      ]
    }
  },
  computed: {
	},
  async mounted() {
    let user = await authStateChanged();
    if (user.uid) {
      this.isLogin=true;
      this.user = user;
      try {
        //ログインユーザの情報から所属するグループのPathを取得
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef); //userデータ
        const roomPath = querySnapshot.data().group;
        const userName = querySnapshot.data().name;
        const roomRef = doc(fireStore, "groups", roomPath);
        const roomData = await getDoc(roomRef);
        this.userRef = docRef;
        this.roomPath = roomPath;
        this.temprName = roomData.data().name;
        this.roomName = this.temprName;
        this.userName = userName;
        this.tempUserName = userName;
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
  computed: {
		width: function() {
			return this.$vuetify.breakpoint.width/5*4;
		}
	},
  methods: {
    goToHome() {
      this.$router.push('/room')
    },
    async logout() {
      this.$router.push("/");
      this.$store.commit("setIsLogin", false);
      await userLogout();
    },
    /**
     * ログアウト前に確認ダイアログを表示する
     * 変更に漏れがないかも確認する
     */
    check_logout() {
      this.logout_dialog = true;
    },

    /**
     * ルーム名変更時に確認ダイアログを表示する
     * 変更に漏れがないかも確認する
     */
    check_rname() {
      if (this.temprName==="" || this.temprName===null) {
        this.$store.commit("addMessage", {
          text: `新しいルーム名を入力してください`,
          risk: 3,
        });
      }
      else {
        this.rname_dialog = true;
      }
    },

    /**
     * ルーム名変更
     * check_rname後のダイアログで実行される
     */
    async change_rname() {
      try {
        await updateDoc(this.userRef,{
          myroomName: this.temprName,
        })
        this.$store.commit("addMessage", {
          text: `ルーム名を変更しました`,
          risk: 1,
        });
        this.rname_dialog = false;
      }
      catch (error) {
        console.log(error);
      }
    },

    /**
     * ルーム名変更時に元のroom名に戻す場合
     */
    reget_rname() {
      this.temprName = this.roomName;
    },

    /**
     * ユーザ名変更時に確認ダイアログを表示する
     * 変更に漏れがないかも確認する
     * ここでの変更は全体に反映
     */
    check_uname() {
      if (this.tempUserName==="" || this.tempUserName===null) {
        this.$store.commit("addMessage", {
          text: `新しいユーザ名を入力してください`,
          risk: 3,
        });
      }
      else {
        this.uname_dialog = true;
      }
    },

    /**
     * ユーザ名変更
     * check_uname後のダイアログで実行される
     */
    async change_uname() {
      try {
        await saveHistory(this.roomPath, this.user.uid, 
          `${this.user.displayName}が名前を${this.tempUserName}に変更しました`
        )
        await updateDoc(this.userRef,{
          name: this.tempUserName,
        })
        //usernameはauthを方をよく使うので，そっちの変更も行う
        await updateProfile(getAuth().currentUser, {
          displayName: this.tempUserName,
        })
        this.$store.commit("addMessage", {
          text: `ユーザ名を変更しました`,
          risk: 1,
        });
        
        this.uname_dialog = false;
      }
      catch (error) {
        console.log(error);
      }
    },

    /**
     * ユーザ名変更時に元に戻す場合
     */
    reget_uname() {
      this.tempUserName = this.userName;
    },

    /**
     * 壁紙の色変更
     * 実行後にログを表示
     */
    change_bg() {},

    /**
     * 壁紙の色を元に戻す
     */
    reget_bg() {},


  }
})
</script>
<style scss>

.input_case2 {
  font-family:  serif;
}
</style>