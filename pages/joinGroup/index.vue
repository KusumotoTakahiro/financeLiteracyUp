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
          <v-card
            :height="$vuetify.breakpoint.height/3*2"
          >
            <v-data-table
              v-model="selected"
              :headers="headers"
              :items="invitation"
              :single-select="true"
              item-key="fromWhom"
              show-select
              class="elevation-1"
              fixed-header
            ></v-data-table>
            <v-card-actions>
              <v-btn
                color="green darken-1"
                text
                @click="joinGroup()"
              >参加する</v-btn>
            </v-card-actions>
          </v-card>
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
      comColl: null,
      unsubscribe: null,
      uid: null,
    }
  },
  async mounted() {
    let user = await authStateChanged();
    console.log(user);
    if (user.uid) {
      try {
        this.uid = user.uid;
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        const attribute = querySnapshot.data().attribute;
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
              data.time = (data.time).toDate();
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
  methods: {
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
            const inviteRef = doc(fireStore, "users", this.uid, "comminicate", this.uid);
            await deleteDoc(inviteRef);
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
    this.unsubscribe();
  }
}
</script>
<style>

</style>