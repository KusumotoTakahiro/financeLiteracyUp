<template>
    <v-row align-content="center" justify="center">
      <v-col cols="12" sm="12" md="12" lg="12" xl="12" align="center">
        <div>
          <v-card
            class="
              d-flex 
              align-content-space-around 
              justify-space-around 
              flex-wrap 
              mt-15"
            flat
            tile
            :height="$vuetify.breakpoint.height-200"
          >
          <v-card
            @click.stop="dialog1=true; dialog2=false"
            outlined
            width="200"
            class="mb-3"
            elevation="4"
            style="background-color: white;"
          >
            <v-card-text class="my-auto black--text text-h6">
              <v-row justify="center">
                グループ検索
              </v-row>
              <v-row justify="center" class="mt-10">
                <v-icon color="orange lighten-1" large>mdi-home-search-outline</v-icon>
              </v-row>
            </v-card-text>
          </v-card>
          <v-card
            @click.stop="dialog1=false; dialog2=true;"
            outlined
            width="200"
            class="mx-1 mb-3"
            elevation="4"
            style="background-color: white;"
          >
            <v-card-text class="my-auto black--text text-h6">
              <v-row justify="center">
                招待通知
              </v-row>
              <v-row justify="center" class="mt-10">
                <v-icon color="pink lighten-1" large>mdi-alarm-note</v-icon>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card>
        <v-dialog
          v-model="dialog1"
          :max-width="$vuetify.breakpoint.width/2"
          hide-overlay
          content-class="rounded-lg elevation-2"
          transition="dialog-bottom-transition"
        >
          <v-card
            :height="$vuetify.breakpoint.height/3*2"
          >
            <v-card-text>
              ああああああああああああ
              いいいいいいいいいいいい
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="dialog2"
          :max-width="$vuetify.breakpoint.width/2"
          hide-overlay
          content-class="rounded-lg elevation-2"
          transition="dialog-bottom-transition"
        >
        <v-alert 
          class="
            justify-center 
            text-center 
            text-h6
            pb-0
          "> 招待されているルーム </v-alert>
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="invitation"
            :single-select="true"
            item-key="fromWhomUid"
            show-select
            class="elevation-1"
            :height="$vuetify.breakpoint.height/5*2"
            fixed-header
          ></v-data-table>
          <v-row 
            class="mt-3 mb-3 mx-auto"
            align-content="center"
            justify="space-around">
            <v-btn
              color=""
              @click="confirm_dialog()"
            >参加する</v-btn>
          </v-row>
        </v-dialog>
        <v-dialog
          v-model="cdialog"
          outlined
          hide-overlay
          :max-width="width/5*3"
          content-class="rounded-lg elevation-3"
          transition="dialog-bottom-transition"
          persistent
        >
        <div style="background-color: white;">
          <v-alert
            class="justify-center text-center text-body-2"
          >
            {{selected_room.roomName}}に参加します
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
              @click="joinGroup()"
            >はい</v-btn>
            <v-btn
              class="black--text px-2"
              height="40"
              @click="cdialog=false"
            >いいえ</v-btn>
          </v-row>
        </div>
        </v-dialog>
      </div>
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
  query,
  onSnapshot,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import {
  fireStore,
} from "~/plugins/firebase";
import {authStateChanged} from '@/plugins/auth'


export default {
  name: 'joinGroupPage',
  layout: "default",
  data() {
    return {
      dialog1: false,
      dialog2: false,
      cdialog: false,
      headers: [
        {
          text: 'ユーザ名',
          align: 'start',
          sortable: false,
          value: 'fromWhom'
        },
        {
          text: 'グループ',
          value: 'roomName'
        },
        {
          text: '招待日',
          value: 'time'
        }
      ],
      invitation: [],
      selected: [],
      selected_room: "",
      comColl: null,
      unsubscribe: null,
      uid: null,
      attribute: null,
      name: null,
    }
  },
  async mounted() {
    let user = await authStateChanged();
    console.log(user);
    if (user.uid) {
      try {
        this.uid = user.uid;
        this.name = user.displayName;
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        const attribute = querySnapshot.data().attribute;
        this.attribute = attribute;
        if (attribute!=="child") {
          this.$store.commit("addMessage", {
            text: "不正アクセスです．ユーザ種別が違います.",
            risk: 3,
          })
          this.$router.push('/');
        }

        //comminicateのコレクションを取得
        const comColl = collection(fireStore, "users", user.uid, "comminicate");
        this.comColl = comColl;
        const com_all = await getDocs(comColl);

        ///comminicateのリアルタイム同期を始める．
        //ログアウトまたは，ルーム決定のどちからで，リッスンを止める
        console.log('start real time Listten');
        const q = query(comColl, where("forWhat", "==", "invite"));
        this.unsubscribe = onSnapshot(q, 
          (snapshot) => {
            snapshot.docChanges().forEach((change)=>{
              let data = change.doc.data();
              data.time = (data.time).toDate().toLocaleDateString();
              
              if (change.type==="added") {
                //同じアカウント名からの招待は最新のものを受け取る．
                this.invitation.push(data);
              }
              if (change.type==="modified") {
                //同じアカウント名からの招待は最新のものを受け取る．
                this.invitation.push(data);
              }
            })
          },
          (error) => {
            console.log(error);
          }
        )
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
    confirm_dialog() {
      let obj = this.selected;
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          this.selected_room = obj[key];
        }
      }
      this.cdialog=true;
    },
    async joinGroup() {
      let obj = this.selected;
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          try {
            //ここでルームパスを更新する
            console.log(obj[key].roomPath)
            const docRef = doc(fireStore, "users", this.uid);
            await updateDoc(docRef, {
              group: obj[key].roomPath,
            })
            //次に，グループのメンバーとして自分を登録する
            const memberColl = collection(fireStore, "groups", obj[key].roomPath, "member");
            await setDoc(doc(memberColl), {
              name: this.name,
              uid: this.uid,
              attribute: this.attribute,
            })
            //最後に通知は消しておく．（実際は消して消さなくてもいいかも）
            const inviteRef = doc(fireStore, "users", this.uid, "comminicate", this.uid);
            await deleteDoc(inviteRef);

            //ログインしたことをstateに保存
            this.$store.commit("setIsLogin", true);
            this.$router.push('/room');
          }
          catch(error) {
            console.log(error);
          }
        }
      }
    }
  },
  beforeDestroy() {
    console.log('beforeDestroy');
    console.log('unsubscribe: end realtime listen')
    this.unsubscribe();
  }
}
</script>
<style>

</style>