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
        <page-header title="メッセージ一覧" />
        <div class="main mb-10 mt-10">
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="freeTrades"
            :single-select="false"
            item-key="id"
            show-select
            class="elevation-0"
            fixed-header
            :height="$vuetify.breakpoint.height-210"
          ></v-data-table>
          <v-row
            class="mt-3 mb-3 mx-auto"
            align-content="center"
            justify="space-around"
          >
            <v-btn class="mx-1 mb-1" width="7rem" @click="dialog=true">
              項目追加
            </v-btn>
            <v-btn class="mx-1 mb-1" width="7rem" @click="goToHome()">
              Home
            </v-btn>
          </v-row>
        </div>
      </v-card>
      <!-- 個別追加 -->
      <add-free-trade 
        :dialog='dialog'
        subject='freeTrades'
        :subjectCollRef='freeTradeCollRef'
        @compAddOne='compAddOne'
      ></add-free-trade>
    </v-col>
  </v-row>
</template>
<script>
import {
  collection,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  fireStore,
} from "~/plugins/firebase";
import {
  authStateChanged,
} from '@/plugins/auth'
import '@/plugins/typeDefine'
import {
  fetch_items,
} from '~/plugins/crudActions';

export default ({
  name: 'FreeTradeParentPage',
  layout: "default",

  head: {
    link: [
      {rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Material+Icons"}
    ]
  },

  data() {
    return {
      dialog: false,
      content: "",
      price: null,
      roomPath: null,
      freeTradeCollRef: null,
      user: null,
      selected: [],
      headers: [
        {
          text: 'メッセージ',
          align: 'start',
          sortable: false,
          value: 'content',
        },
        {
          text: '金額（パパ円）',
          value: 'price'
        }
      ],
      freeTrades: [], // DBから取得した全データを格納.
    }
  },
  async mounted() {
    let user = await authStateChanged();
    if (user.uid) {
      this.user = user;
      try {
        //ログインユーザの情報から所属するグループのworksの参照を取得
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        const roomPath = querySnapshot.data().group;
        this.roomPath = roomPath;
        const freeTradeCollRef = collection(fireStore, "groups", roomPath, "freeTrades")
        this.freeTradeCollRef = freeTradeCollRef;
        
        //参照の中からworksを取得して，works(collection)の中のdocumentを全取得
        this.freeTrades = await fetch_items(freeTradeCollRef);
      }
      catch(e) {
        this.message('『'+String(e) + '』が発生しました', 3)
      }
    }
    else {
      this.message('ログインしてください', 3);
      this.$router.push('/');
    }
  },
  beforeDestroy() {},
  computed: {
		width: function() {
			return this.$vuetify.breakpoint.width/5*4;
		},
	},
  methods: {
    // ホームボタンを押したときの関数
    goToHome() {
      this.$router.push('/room')
    },
    compAddOne(data) {
      console.log(data);
      this.dialog = data.dialog;
      this.freeTrades = data.items;
    },
    /**
     * store経由でuserにアラートを数秒提示する関数．
     * @param {string} text - アラートに表示する内容．
     * @param {number} risk - アラートの色を指定する1が緑,2が黄色,3が赤
     */
    message(text, risk) {
      this.$store.commit("addMessage", {text, risk});
    }
  },
  
})
</script>
<style scss>
.input_case {
  font-family: 'serif'
}
</style>