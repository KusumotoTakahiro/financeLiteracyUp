<template>
  <v-row align-content="center" justify="center">
    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
      <v-card>
        <div class="header">
          <v-alert 
            class="
              justify-center 
              text-center 
              text-h6
              "
        > 履歴 </v-alert>
        </div>
        
      </v-card>
      <v-card
        class="
          d-flex
          algin-content-space-around
          flex-wrap
          justify-center
          mt-1
        "
        elevation="5"
        :width="$vuetify.breakpoint.width"
      >
        <v-data-table
          :headers="headers"
          :items="history"
          :single-select="false"
          item-key="id"
          class="elevation-0"
          fixed-header
          :height="$vuetify.breakpoint.height"
        ></v-data-table>
      </v-card>
      <v-row
          class="mt-3 mb-3 mx-auto"
          align-content="center"
          justify="space-around"
        >
          <v-btn class="mx-auto mb-1" width="7rem" @click="goToHome()">
            Homeに戻る
          </v-btn>
        </v-row>
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
import {authStateChanged} from '@/plugins/auth'
import { fromStringWithSourceMap } from "source-list-map";

export default {
  data: () => ({
    selected: [],
    headers: [
      {
        align: 'start',
        sortable: false,
        value: 'processed_date',
      },
      {
        value: 'data',
      },
    ],
    history: [],
    roomPath: null,
    historyCollRef: null,
  }),
  async mounted() {
    let user = await authStateChanged();
    if (user.uid) {
      try {
        //ログインユーザの情報から所属するグループのpresentsの参照を取得
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        const roomPath = querySnapshot.data().group;
        this.roomPath = roomPath;
        const historyCollRef = collection(fireStore, "groups", roomPath, "history")
        this.hitoryCollRef = historyCollRef;

        //参照の中からhistoryを取得
        const history_all = await getDocs(historyCollRef);
        history_all.forEach(doc => {
          let data = doc.data();
          data.id = doc.id;
          data.processed_date = (doc.data().date).toDate().toLocaleString('ja-JP');
          this.history.push(data);
        })
      }
      catch(error) {
        console.log('historyが取得できませんでした');
        console.log(error);
      }
    }
  },
  methods: {
    goToHome() {
      this.$router.push('/room');
    }
  }
}
</script>
<style scoped>

</style>