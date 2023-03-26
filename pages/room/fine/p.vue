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
        <page-header title="現在の罰則一覧"></page-header>
        <div class="main mb-10 mt-10">
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="fines"
            :single-select="false"
            item-key="id"
            show-select
            class="elevation-0"
            fixed-header
            :height="$vuetify.breakpoint.height - 210"
          ></v-data-table>
          <v-row
            class="mt-3 mb-3 mx-auto"
            align-content="center"
            justify="space-around"
          >
            <v-btn class="mx-1 mb-1" width="7rem" @click="change_data_file">
              一括編集
            </v-btn>
            <v-btn class="mx-auto mb-1" width="7rem" @click="dialog=true">
              追加
            </v-btn>
            <v-btn class="mx-auto mb-1" width="7rem" @click="delete_items()">
              削除
            </v-btn>
            <v-btn
              class="mx-auto mb-1"
              width="7rem"
              @click="goToHome()"
            >Homeに戻る</v-btn>
          </v-row>
        </div>
      </v-card>
      
      <!-- 一括編集 -->
      <v-dialog
        v-model="dialog_file"
        persistent
        max-width="600"
        transition="dialog-bottom-transition"
      >
        <v-card 
          class="py-5"
          elevation="7"
          outlined
          shaped
        >
          <v-card-title class="justify-center">一括編集</v-card-title>
          <v-card-text 
            class="
            d-flex
            justify-center
            mx-auto
          ">
            <div id="mytable"></div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- 個別追加 -->
      <add-one 
        :dialog='dialog'
        subject='fines'
        :subjectCollRef='fineCollRef'
        @compAddOne='compAddOne'
      ></add-one>
      
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
  save_data_by_jspreadsheet as save_data,
  create_item,
  delete_items,
  fetch_items,
  clear_myTable,
  create_myTable
} from '~/plugins/crudActions';
import EventBus from "~/plugins/event-bus";

export default ({
  name: 'fineParentPage',
  layout: "default",

  head: {
    link: [
      {rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Material+Icons"}
    ]
  },

  data() {
    return {
      dialog: false,
      dialog_file: false,
      content: "",
      price: null,
      isLogin: false,
      roomPath: null,
      fineCollRef: null,
      user: null,
      selected: [],
      headers: [
        {
          text: '罰則',
          align: 'start',
          sortable: false,
          value: 'content',
        },
        {
          text: '罰金（パパ円）',
          value: 'price'
        }
      ],
      columns: [
        { 
          type: 'text',
          title: '罰則',
          width: 250
        },
        { 
          type: 'numeric',
          title: '罰金',
          width: 200,
        }, 
      ],
      fines: [],
      myTableData: []
    }
  },
  async mounted() {
    let user = await authStateChanged();
    if (user.uid) {
      this.isLogin=true;
      this.user = user;
      try {
        //ログインユーザの情報から所属するグループのfinesの参照を取得
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        const roomPath = querySnapshot.data().group;
        this.roomPath = roomPath;
        const fineCollRef = collection(fireStore, "groups", roomPath, "fines")
        this.fineCollRef = fineCollRef;
        
        //参照の中からfinesを取得して，fines(collection)の中のdocumentを全取得
        this.fines = await fetch_items(fineCollRef)
      }
      catch(error) {
        this.message('『'+String(e) + '』が発生しました', 3)
      }
    }
    else {
      this.message('ログインしてください', 3)
      this.$router.push('/');
    }
    EventBus.$on('res', async res => {
      if (res==='close') this.dialog_file = false;
      else if (res.type==='save') {
        this.myTableData = res.data;
        await this.edit_all();
      }
    });
  },
  beforeDestroy() {
    console.log('beforeDestroy');
    EventBus.$off('res');
  },
  computed: {
    width: function() {
      return this.$vuetify.breakpoint.width/5*4;
    },
  },
  methods: {
    goToHome() {
      this.$router.push('/room')
    },
    change_data_file() {
      this.dialog_file = true;
      setTimeout(() => {
        clear_myTable();  //myTableの初期化
        create_myTable(this.fines, this.columns);
      }, 100)
    },
    compAddOne(data) {
      console.log(data);
      this.dialog = data.dialog;
      this.fines = data.items;
    },
    async delete_items() {
      await delete_items('fines', this.selected)
      .then(async result => {
        if (result.error) {
          this.message(result.message, 3);
        } else {
          this.message(result.message, 1);
          this.fines = await fetch_items(this.fineCollRef);
          this.selected = [];
        }
      })
    },
    async edit_all() {
      await save_data(this.myTableData, this.fines, 'fines')
      .then(async result => {
        if (result.error) {
          this.message(result.message, 3);
        } else {
          this.message(result.message, 1);
          this.fines = await fetch_items(this.fineCollRef);
          this.dialog_file = false;
        }
      })
    },
    /**
     * store経由でuserにアラートを数秒提示する関数．
     * @param {string} text - アラートに表示する内容．
     * @param {number} risk - アラートの色を指定する1が緑,2が黄色,3が赤
     */
    message(text, risk) {
      this.$store.commit("addMessage", {text, risk});
    }
  }
})
</script>
<style scoped>
.input_case {
  font-family: 'serif'
}
</style>