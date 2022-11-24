<template>
  <v-row align-content="center" justify="center" class="bg-yellow">
    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
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
						elevation="2"> ルームの諸設定
          </v-alert>
        </div>
        <div class="main mb-10 mt-10">
          <div>
            <div class="form-header text-center mt-10">ルーム名の変更</div>
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
            <v-row 
              class="mt-1 mb-3 mx-auto"
              align-content="center"
              justify="space-around"
            >
              <v-btn
                class="black--text mt-5"
                height="40"
                width="200px"
                color=""
                @click="check()"
              > 変 更 </v-btn>
            </v-row>
          </div>
          <v-divider></v-divider>
          <div>
            <div class="form-header text-center mt-2">子供の金額調整</div>
          </div>
          <v-data-table
            :headers="headers"
            :items="children"
            item-key="uid"
            class="elevation-1"
            fixed-header
          >
          <template v-slot:item.data.balance="props">
            <v-edit-dialog
              :return-value.sync="props.item.data.balance"
              large
              persistent
              style="height:auto"
              @save="save(props.item.data.balance, props.item.uid, props.item.data.name)"
            >
              <div>{{ props.item.data.balance }}</div>
              <template v-slot:input>
                <div class="text-center">
                  残高を変更
                </div>
                <v-text-field
                  v-model="props.item.data.balance"
                  label="Edit"
                  single-line
                  autofocus
                  type="tel"
                  class="input_case2"
                ></v-text-field>
              </template>
            </v-edit-dialog>
          </template>
          </v-data-table>
          <v-row
            class="mt-3 mb-3 mx-auto"
            align-content="center"
            justify="space-around"
          >
            <v-btn class="mx-auto mb-1" width="7rem" @click="goToHome()">
              Homeに戻る
            </v-btn>
          </v-row>
        </div>
      </v-card>
      <v-dialog
        v-model="cdialog"
        outlined
        hide-overlay
        :height="$vuetify.breakpoint.height"
        max-width="600"
        content-class="rounded-lg elevation-2"
        transition="dialog-bottom-transition"
        persistent
      >
      <div style="background-color: white;">
        <v-alert
          class="justify-center text-center text-body-2"
        >
          ルーム名を変更します．
          <br/>よろしいですか？
        </v-alert>
        <v-row 
          class="mt-3 mb-0 mx-auto pb-5"
          align-content="center" 
          justify="space-around" 
          style="height:40px">
          <v-btn
            class="black--text"
            height="40"
            @click="change_name()"
          >はい</v-btn>
          <v-btn
            class="black--text px-2"
            height="40"
            @click="cdialog=false"
          >いいえ</v-btn>
        </v-row>
        </div>
      </v-dialog>
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
} from '@/plugins/auth'

export default ({
  name: 'settingPage',
  layout: "default",

  data() {
    return {
      cdialog: false,
      roomName: "",
      price: null,
      isLogin: false,
      roomPath: null,
      children: [],
      memberCollRef: null,
      user: null,
      headers: [
        {
          text: '名前',
          align: 'start',
          sortable: false,
          value: 'data.name',
        },
        {
          text: '現在の残高（パパ円）',
          sortable: false,
          value: 'data.balance'
        }
      ],
    }
  },
  async mounted() {
    let user = await authStateChanged();
    if (user.uid) {
      this.isLogin=true;
      this.user = user;
      try {
        //ログインユーザの情報から所属するグループのworksの参照を取得
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        const roomPath = querySnapshot.data().group;
        this.roomPath = roomPath;
        
        //自分のグループに参加しているchildユーザを全取得
        try {
          const memberCollRef = collection(fireStore, "groups", roomPath, "member");
          this.memberCollRef = memberCollRef;
          const member = await getDocs(memberCollRef);
          console.log(member);
          const children = []
          member.forEach(doc => {
            if (doc.data().attribute==="child") {
              children.push(doc.data());
              console.log('child', doc.data())
            }
          })
          try {
            for (let i = 0; i < children.length; i++) {
              const childRef = doc(fireStore, "users", children[i].uid);
              const childData = await getDoc(childRef);
              let child = {}
              child.data = childData.data();
              child.uid = children[i].uid;
              this.children.push(child);
            }
            console.log(this.children);
          }
          catch (error) {
            console.log('分割してみた')
            console.log(error);
          }
        }
        catch (error) {
          console.log('memberが取得できなかったエラー');
          console.log(error);
        }
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
    check() {
      if (this.roomName === "") {
        this.$store.commit("addMessage", {
          text: `ルーム名を入力してください`,
          risk: 3,
        });
      }
      else {
        this.cdialog = true;
      }
    },
    async change_name() {
      const roomColl = doc(fireStore, "groups", this.roomPath);
      await updateDoc(roomColl, {
        name: this.roomName,
      })
      this.cdialog = false;
      this.$store.commit("addMessage", {
        text: `ルーム名を変更しました！`,
        risk: 1,
      });
      await saveHistory(this.roomPath, this.user.uid, 
        `${this.user.displayName}がルーム名を${this.roomName}に変更しました`
      )
    },
    async save(balance, userId, userName) {
      if (!String(balance).match(/^[+,-]?([1-9]\d*|0)$/)) {
        this.$store.commit("addMessage", {
          text: `半角数字で入力してください`,
          risk: 3,
        });
        return;
      }
      const userRef = doc(fireStore, "users", userId);
      await updateDoc(userRef, {
        balance: Number(balance),
      })
      this.$store.commit("addMessage", {
        text: `残高を更新しました`,
        risk: 1,
      });
      await saveHistory(this.roomPath, this.user.uid, 
        `${this.user.displayName}が${userName}の残高を${balance}に変更しました`
      )
      console.log(balance);
    },
    open(balance) {
      //一時的に保存しておく
      this.tempBalance = Nubmer(balance);
    }
    
  }
})
</script>
<style scss>

.input_case2 {
  font-family:  serif;
}
</style>