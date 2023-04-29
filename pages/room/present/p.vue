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
        <page-header title="現在のご褒美一覧"></page-header>
        <div class="main mb-10 mt-10">
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="presents"
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
            <v-btn class="mx-auto mb-1" width="7rem" @click="dialog=true">
              追加
            </v-btn>
            <v-btn class="mx-auto mb-1" width="7rem" @click="delete_items()">
              削除
            </v-btn>
            <v-btn class="mx-auto mb-1" width="7rem" @click="goToHome()">
              Home
            </v-btn>
          </v-row>
        </div>
      </v-card>
      <!-- 一括編集のダイアログ -->
      <v-dialog
        v-model="dialog_file"
        persistent
        max-width="750"
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
        :height="$vuetify.breakpoint.height"
        max-width="600"
        hide-overlay
        outlined
        content-class="rounded-lg elevation-2"
        transition="dialog-bottom-transition"
      >
        <v-card 
          class="py-5"
          elevation="7"
          outlined
          shaped
        >
          <v-card-title class="justify-center pt-0 pb-0">ご褒美追加</v-card-title>
          <v-card-text>
            <template>
              <div>
                <div class="form-header">内容</div>
                <v-text-field
                  v-model="content"
                  clearable
                  placeholder="ご褒美の内容を記入してください"
                  dense
                  color=""
                  outlined
                  type="text"
                  hide-details=""
                  class="input_case mb-2"
                ></v-text-field>
              </div>
              <div>
                <div class="form-header mb-2">対象者</div>
                <v-select
                  v-model="forWhom"
                  :items="children"
                  item-text="data.name"
                  item-value="uid"
                  return-object
                  multiple
                  class="mt-0 pt-0"  
                >
                  <template v-slot:selection="{item}">
                  <v-chip
                    class="ma-2"
                    color="primary"
                    outlined
                    pill
                    close
                    large
                    @click:close="chip_delete(item.uid)"
                  >
                    {{item.data.name}}
                    <v-icon right>
                      mdi-account-outline
                    </v-icon>
                  </v-chip>
                  </template>
                  
                </v-select>
              </div>
              <div>
                <div class="form-header">報酬</div>
                <v-text-field
                  v-model="price"
                  clearable
                  dense
                  color=""
                  outlined
                  type="tel"
                  hide-details=""
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
          <v-card-actions class="justify-end pb-0 pt-0">
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
import {
  save_data_by_jspreadsheet_for_presents as save_data,
  create_myTable,
  clear_myTable,
  delete_items,
  create_item_for_presents,
  fetch_items,
  fetch_children
} from '~/plugins/crudActions';
import EventBus from "~/plugins/event-bus";

export default ({
  name: 'presentParentPage',
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
      forWhom: [],
      price: null,
      isLogin: false,
      roomPath: null,
      presentCollRef: null,
      memberCollRef: null,
      user: null,
      children: [],
      selected: [],
      headers: [
        {
          text: 'ご褒美',
          align: 'start',
          sortable: false,
          value: 'content',
        },
        {
          text: '対象者',
          value: 'forWhom.name',
        },
        {
          text: '報酬（パパ円）',
          value: 'price'
        }
      ],
      column_content: {
        type: 'text',
        title: 'お手伝い',
        width: 250
      },
      column_price: {
        type: 'numeric',
        title: '報酬',
        width: 200
      },
      columns: [],
      presents: [],
      myTableData: []
    }
  },
  async mounted() {
    let user = await authStateChanged();
    if (user.uid) {
      this.isLogin=true;
      this.user = user;
      try {
        //ログインユーザの情報から所属するグループのpresentsの参照を取得
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        const roomPath = querySnapshot.data().group;
        this.roomPath = roomPath;
        const presentCollRef = collection(fireStore, "groups", roomPath, "presents")
        this.presentCollRef = presentCollRef;
        
        //参照の中からpresentsを取得して，presents(collection)の中のdocumentを全取得
        this.presents = await fetch_items(presentCollRef);

        //自分のグループに参加しているchildユーザを全取得
        try {
          const memberCollRef = collection(fireStore, "groups", roomPath, "member");
          let children = await fetch_children(memberCollRef);
          this.children = children;
          this.createColumns(children);
        }
        catch (error) {
          // memberが取得できなかったエラー
          this.message('『'+String(error) + '』が発生しました', 3);
        }
      }
      catch(error) {
        // presentsが取得できなかったエラー
        this.message('『'+String(error) + '』が発生しました', 3);
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
  beforeDestroy() {
    EventBus.$off('res');
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
    chip_delete(uid) {
      console.log('chip_delete');
      let newary = this.forWhom.filter(one => one.uid !== uid)
      this.forWhom = newary;
    },
    change_data_file() {
      this.dialog_file = true;
      setTimeout(() => {
        clear_myTable();  //myTableの初期化
        create_myTable(this.presents, this.columns);
      }, 100)
    },
    async create_item() { //tableに登録するアイテムの作成
      const user = await authStateChanged();
      const result = await create_item_for_presents(
        user, 'presents', this.content, this.price, this.forWhom);
      if (result.error) {
        this.message(result.message, 3);
      } else {
        this.message(result.message, 1);
        this.presents = await fetch_items(this.presentCollRef);
        this.dialog = false;
        this.content = "";
        this.price = null;
      }
    },
    async edit_all() {
      await save_data(this.myTableData, this.presents, this.children, 'presents')
      .then(async result => {
        if (result.error) {
          this.message(result.message, 3);
        } else {
          this.message(result.message, 1);
          this.presents = await fetch_items(this.presentCollRef);
          this.dialog_file = false;
        }
      })
    },
    async delete_items(){ //既にtableに登録されているアイテムのうち選択したものを削除
      await delete_items('presents', this.selected)
      .then(async result => {
        if (result.error) {
          this.message(result.message, 3);
        } else {
          this.message(result.message, 1);
          this.presents = await fetch_items(this.presentCollRef);
          this.selected = [];
        }
      })
    },
    getChildrenName(children) {
      let childrenName = []
      for (let i = 0; i < children.length; i++) {
        childrenName.push(children[i].data.name);
      }
      return childrenName;
    },
    createColumns(children) {
      let columns = [];
      columns[0] = this.column_content;
      const childrenName = this.getChildrenName(children);
      columns[1] = {
        type: 'dropdown',
        title: '対象者',
        width: 200,
        source: childrenName
      }
      columns[2] = this.column_price;
      this.columns = columns;
    },
    message(text, risk) {
      this.$store.commit("addMessage", {text, risk});
    }
  }
})
</script>
<style>
.input_case {
  font-family: 'serif'
}

.jexcel_toolbar i {
  margin-left: auto;
  margin-right: auto;
}
</style>