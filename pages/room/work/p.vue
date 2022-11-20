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
            <v-btn class="mx-auto mb-1" width="7rem" @click="dialog_2=true">
              一括追加
            </v-btn>
            <v-btn class="mx-auto mb-1" width="7rem" @click="dialog=true">
              追加
            </v-btn>
            <v-btn class="mx-auto mb-1" width="7rem" @click="delete_items()">
              削除
            </v-btn>
            <v-btn class="mx-auto mb-1" width="7rem" @click="goToHome()">
              Homeに戻る
            </v-btn>
          </v-row>
        </div>
      </v-card>
      <v-dialog
        v-model="dialog_2"
        outlined
        hide-overlay
        :height="$vuetify.breakpoint.height"
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
          <v-card-title class="justify-center">お手伝い一括追加</v-card-title>
          <v-card-text>
            <template>
              <div>
                <v-file-input
                  show-size
                  accept=".csv"
                  @change="onFileChange"
                  label="csvファイルを入力してください"
                ></v-file-input>
              </div>
              <div>  
                <v-btn
                  :disabled="disabled"
                  class="black--text mt-5"
                  block
                  height="40"
                  color=""
                  @click="create_items_from_csv()"
                >登録</v-btn>
              </div>
              <div>  
                <v-btn
                  class="black--text mt-5"
                  block
                  height="40"
                  color=""
                  @click="download_format()"
                >フォーマットのダウンロード</v-btn>
              </div>
            </template>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              text
              @click="dialog_2 = false"
            >Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="dialog"
        outlined
        hide-overlay
        :height="$vuetify.breakpoint.height"
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
                  color=""
                  outlined
                  type="text"
                  hide-details=""
                  class="input_case"
                ></v-text-field>
              </div>
              <div>
                <div class="form-header">報酬</div>
                <v-text-field
                  v-model="price"
                  clearable
                  dense
                  color=""
                  outlined
                  type="text"
                  hide-details=""
                  class="input_case"
                ></v-text-field>
                <v-slider
                  v-model="price"
                  color="orange"
                  label="price"
                  min="0"
                  max="500"
                  ticks="always"
                  thumb-label
                ></v-slider>
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
  name: 'workParentPage',
  layout: "default",

  data() {
    return {
      dialog: false,
      dialog_2: false,
      main_dialog: true,
      file: null,
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
      works: []
    }
  },
  async mounted() {
    let user = await authStateChanged();
    console.log(user);
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
        const works_all = await getDocs(workCollRef);
        console.log(works_all)
        works_all.forEach(doc => {
          //ここでworksを更新する =>データがテーブルに反映されるはず
          let data = doc.data();
          data.id = doc.id;
          this.works.push(data);
        })
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
		},
    disabled: function() {
      return this.file===null? true : false;
    }
	},
  methods: {
    goToHome() {
      this.$router.push('/room')
    },
    async create_item() { //tableに登録するアイテムの作成 作成は一つずつ
      let flag = true;
      if (!this.is_written(this.content, this.price)) {
        flag = false;
        this.$store.commit("addMessage", {
          text: `記入漏れがあります`,
          risk: 3,
        });
      }
      else if (!this.is_long(this.content)) {
        flag = false;
        this.$store.commit("addMessage", {
          texat: `内容の説明が短いです`,
          risk: 3,
        });
      }
      if (flag) {
        try {
          await addDoc(this.workCollRef, {
            content: this.content,
            price: this.price,        
          })
          await saveHistory(this.roomPath, this.user.uid, 
            `${this.user.displayName}が${this.content}を『お手伝い』に追加しました`
          )
        }
        catch(error) {
          console.log('create_item error');
          console.log(error);
        }
        this.dialog = false;
        this.content = "";
        this.price = null;
        this.fetch_works();
      }
    },
    async delete_items(){ //既にtableに登録されているアイテムのうち選択したものを削除
      let obj = this.selected;
      for(let key in obj ) {
        if( obj.hasOwnProperty(key) ) {
          console.log(obj[key])
          try {
            await deleteDoc(doc(fireStore, "groups", this.roomPath, "works", obj[key].id));
            await saveHistory(this.roomPath, this.user.uid, 
              `${this.user.displayName}が${obj[key].content}を『お手伝い』から削除しました`
            )
          }
          catch(error) {
            console.log(error)
          }
        }
      }
      await this.fetch_works();
    },
    async fetch_works() {
      console.log('fetch_works')
      const works_all = await getDocs(this.workCollRef);
      this.works = [];
      works_all.forEach(doc => {
        //ここでworksを更新する =>データがテーブルに反映されるはず
        try {
          let data = doc.data();
          data.id = doc.id;
          this.works.push(data);
          console.log(data);
        }
        catch(error) {
          console.log(error);
        }
        
      })
    },
    is_written(content, price) {
      let ok = true;
      if (!content) {
        ok = false;
      }
      if (!price) {
        ok = false;
      }
      return ok;
    },
    is_long(content) {
      let ok = true;
      if (content.length==1) ok = false;
      return ok;
    }
  },
  download_format() {
    console.log('format_download');
  },
  create_items_from_csv() {
    console.log('create_items_from_csv');
  },
  create_item_for_csv() { 
    console.log('create_item_for_csv');
  },
  onFileChange(file) {
    return new Promise((resolve, reject)=> {
      if (file) {
        if (file.name.indexOf('.csv') > -1) {
          this.file = file;
        }
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(JSON.parse(e.target.result.split('\r\n')));
      reader.onerror = () => reject(error);
      reader.readerAsText(file);
    })
  }
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

</style>