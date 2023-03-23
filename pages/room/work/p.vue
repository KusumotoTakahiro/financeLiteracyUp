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
						elevation="2"> 現在のお手伝い一覧 
          </v-alert>
        </div>
        <div class="main mb-10 mt-10">
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="works"
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
            <v-btn class="mx-1 mb-1" width="7rem" @click="change_data_file">
              一括編集
            </v-btn>
            <v-btn class="mx-1 mb-1" width="7rem" @click="dialog=true">
              項目追加
            </v-btn>
            <v-btn class="mx-1 mb-1" width="7rem" @click="delete_items()">
              項目削除
            </v-btn>
            <v-btn class="mx-1 mb-1" width="7rem" @click="goToHome()">
              Home
            </v-btn>
          </v-row>
        </div>
      </v-card>
      <!-- 一括編集のダイアログ -->
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
      <v-dialog
        v-model="dialog"
        outlined
        hide-overlay
        max-width="600"
        content-class="rounded-lg elevation-2"
        transition="dialog-bottom-transition"
      >
        <v-card 
          class="py-5"
          elevation="7"
          outlined
          shaped
        >
          <v-card-title class="justify-center">お手伝い追加</v-card-title>
          <v-card-text>
            <template>
              <div>
                <div class="form-header">内容</div>
                <v-text-field
                  v-model="content"
                  clearable
                  placeholder="お手伝いの内容を記入してください"
                  dense
                  outlined
                  type="text"
                  class="input_case"
                ></v-text-field>
              </div>
              <div>
                <div class="form-header">報酬</div>
                <v-text-field
                  v-model="price"
                  clearable
                  dense
                  outlined
                  type="tel"
                  class="input_case"
                ></v-text-field>
                <v-btn
                  class="black--text mt-5"
                  block
                  height="40"
                  color=""
                  @click="create_item()"
                >登録</v-btn>
              </div>
            </template>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              text
              @click="dialog = false"
            >Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
  name: 'workParentPage',
  layout: "default",

  head: {
    link: [
      {rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Material+Icons"}
    ]
  },

  data() {
    return {
      dialog: false,
      dialog_file: false, //一括追加用
      content: "",
      price: null,
      isLogin: false,
      roomPath: null,
      workCollRef: null,
      user: null,
      selected: [],
      headers: [
        {
          text: 'お手伝い',
          align: 'start',
          sortable: false,
          value: 'content',
        },
        {
          text: '報酬（パパ円）',
          value: 'price'
        }
      ],
      columns: [
        { 
          type: 'text',
          title: 'お手伝い',
          width: 250
        },
        { 
          type: 'numeric',
          title: '報酬',
          width: 200,
        }, 
      ],
      works: [], // DBから取得した全データを格納.
      myTableData: [], // 一括修正時のデータを一時的に格納.
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
        const workCollRef = collection(fireStore, "groups", roomPath, "works")
        this.workCollRef = workCollRef;
        
        //参照の中からworksを取得して，works(collection)の中のdocumentを全取得
        this.works = await fetch_items(workCollRef);
      }
      catch(e) {
        this.message('『'+String(e) + '』が発生しました', 3)
      }
    }
    else {
      this.message('ログインしてください', 3);
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
    /**
     * 一括編集ボタン押下時に実行され，myTableを最新状態に書き換えて表示する.
     */
    change_data_file() {
      this.dialog_file = true;
      //処理が前後するとid=mytableの要素がとれないエラーが発生するため，
      //以下のようにsetTimeOutで時間差を作っている．
      setTimeout(() => {
        clear_myTable();  //myTableの初期化
        create_myTable(this.works, this.columns);
      }, 100)
    },
    async create_item() {
      const user = await authStateChanged();
      const result = await create_item(user, 'works', this.content, this.price);
      if (result.error) {
        this.message(result.message, 3);
      } else {
        this.message(result.message, 1);
        this.works = await fetch_items(this.workCollRef);
        this.dialog = false;
      }
    },
    async delete_items() {
      await delete_items('works', this.selected)
      .then(async result => {
        if (result.error) {
          this.message(result.message, 3);
        } else {
          this.message(result.message, 1);
          this.works = await fetch_items(this.workCollRef);
          this.selected = [];
        }
      })
    },
    async edit_all() {
      console.log('edit_all')
      console.log(this.myTableData)
      // myTableのデータを非同期に更新できてない．同期的に取れてるかも不明
      await save_data(this.myTableData, this.works, 'works')
      .then(async result => {
        if (result.error) {
          this.message(result.message, 3);
        } else {
          this.message(result.message, 1);
          this.works = await fetch_items(this.workCollRef);
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
  },
  
})
</script>
<style scss>
.input_case {
  font-family: 'serif'
}

.header {
	z-index: 5;
	width: 100%;
	height: 50px;
	position: fixed;
	vertical-align: top;
}

.main {
	position: relative;
	top: 50px;
}

.bg-grad {
	background: linear-gradient(-45deg,  #9cecfb, #65c7f7, #0052d4, #290BA1);
}

.bg-yellow {
	background-color: #FCFCD7;
}

/* これよくわからんけど，背景色変えれるみたい．どんな理屈で動いてるんや？ */
.theme--light.v-data-table
> .v-data-table__wrapper
> table
> tbody
> tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper)
{
	color: red;
}

.jexcel_toolbar i {
  margin-left: auto;
  margin-right: auto;
}
</style>