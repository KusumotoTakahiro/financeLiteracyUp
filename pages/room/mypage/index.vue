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
              v-model="roomName"
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
                width="200px"
                color=""
                @click="check_rname()"
              > 変 更 </v-btn>
              <v-btn
                class="black--text mt-5"
                height="40"
                width="200px"
                color=""
                @click="reget_rname()"
              > 元に戻す </v-btn>
            </v-row>
          </div>
          <!-- dividerにwidthを付けると変にレイアウトが崩れない -->
          <v-divider width="500" ></v-divider>
          <div>
            <div class="form-header text-center mt-5">ユーザ名の変更</div>
            <v-text-field
              v-model="tempUserName"
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
                width="200px"
                color=""
                @click="check_uname()"
              > 変 更 </v-btn>
              <v-btn
                class="black--text mt-5"
                height="40"
                width="200px"
                color=""
                @click="reget_uname()"
              > 元に戻す </v-btn>
            </v-row>
          </div>
          <!-- dividerにwidthを付けると変にレイアウトが崩れない -->
          <v-divider width="500" ></v-divider>
          <!-- 壁紙設定 -->
          <div>
            <div class="form-header text-center mt-5">壁紙の変更</div>
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
                width="200px"
                color=""
                @click="change_bg()"
              > 変 更 </v-btn>
              <v-btn
                class="black--text mt-5"
                height="40"
                width="200px"
                color=""
                @click="reget_bg()"
              > 元に戻す </v-btn>
            </v-row>
          </div>
          <!-- dividerにwidthを付けると変にレイアウトが崩れない -->
          <v-divider width="500" ></v-divider>
          <v-row 
          class="mt-3 mb-3 mx-auto"
          align-content="center"
          justify="center"
          >
            <v-btn width="200px" @click="check_logout()">ログアウト</v-btn>
          </v-row>
          <v-divider width="500" ></v-divider>
          <v-row
            class="mt-3 mb-3 mx-auto"
            align-content="center"
            justify="center"
          >
            <v-btn width="200px" class="mx-auto mb-1" @click="goToHome()">
              Homeに戻る
            </v-btn>
          </v-row>
        </div>
        
      </v-card>
    </v-col>
  </v-row>
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
  name: 'settingPage',
  layout: "default",

  data() {
    return {
      roomName: "",
      isLogin: false,
      roomPath: null,
      user: null,
      tempUserName: "", //一時的にデータを保存しておく
      userName: "",
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
        this.roomPath = roomPath;
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
    check_logout() {},

    /**
     * ルーム名変更時に確認ダイアログを表示する
     * 変更に漏れがないかも確認する
     */
    check_rname() {},

    /**
     * ルーム名変更
     * check_rname後のダイアログで実行される
     */
    change_rname() {},

    /**
     * ルーム名変更時に元のroom名に戻す場合
     */
    reget_rname() {},

    /**
     * ユーザ名変更時に確認ダイアログを表示する
     * 変更に漏れがないかも確認する
     * ここでの変更は全体に反映
     */
    check_uname() {},

    /**
     * ユーザ名変更
     * check_uname後のダイアログで実行される
     */
    change_uname() {},

    /**
     * ユーザ名変更時に元に戻す場合
     */
    reget_uname() {},

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