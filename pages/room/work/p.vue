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
      <!-- 一括編集 -->
      <!-- 一括編集の確認ダイアログ -->
      <!-- <v-dialog
        v-model="c_dialog_file"
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
          <v-card-title class="justify-center">確認・修正</v-card-title>
          <v-card-text>
            <template>
              <v-data-table
                :headers="headers"
                :items="new_csv"
                item-key="id"
                class="elevation-0"
                fixed-header
                hide-default-header
              >
                <template v-slot:item.content="props">
                  <v-edit-dialog
                    :return-value.sync="props.item.content"
                    persistent
                    style="height:auto"
                    large
                    @save="save"
                    @cancel="cancel"
                    @open="open"
                    @close="close"
                  >
                    <div>{{ props.item.content }}</div>
                    <template v-slot:input>
                      <div class="mt-4 text-body-1 text-center">
                        内容を変更
                      </div>
                      <v-text-field
                        v-model="props.item.content"
                        label="Edit"
                        single-line
                        autofocus
                        class="input_case2 text-center"
                      ></v-text-field>
                    </template>
                  </v-edit-dialog>
                </template>
                <template v-slot:item.price="props">
                  <v-edit-dialog
                    :return-value.sync="props.item.price"
                    persistent
                    style="height:auto"
                    large
                    @save="save"
                    @cancel="cancel"
                    @open="open"
                    @close="close"
                  >
                    <div>{{ props.item.price }}</div>
                    <template v-slot:input>
                      <div class="mt-4 text-body-1 text-center">
                        報酬を変更
                      </div>
                      <v-text-field
                        v-model="props.item.price"
                        label="Edit"
                        single-line
                        counter
                        autofocus
                        type="Number"
                        class="input_case2 text-center"
                      ></v-text-field>
                    </template>
                  </v-edit-dialog>
                </template>
              </v-data-table>
              <div>  
                <v-btn
                  class="black--text mt-0"
                  block
                  height="40"
                  color=""
                  @click="create_items_from_csv()"
                >登録</v-btn>
              </div>
            </template>
          </v-card-text>
          <v-card-actions >
          <v-row justify="space-between">
            <v-btn
              text
              @click="c_dialog_file = false"
              class="mr-3"
            >Close</v-btn>
          </v-row>
          </v-card-actions>
        </v-card>
      </v-dialog> -->
      <!-- 一括編集のダイアログ -->
      <v-dialog
        v-model="dialog_file"
        persistent
        width="auto"
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
import '@/plugins/typeDefine'
import Encoding from  'encoding-japanese';

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
      c_dialog_file: false, //一括追加用
      main_dialog: true,
      csv_data: null, //一括追加用
      new_csv:[], //一括追加用
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
          width: 200
        },
        { 
          type: 'numeric',
          title: '報酬',
          width: 150,
        }, 
      ],
      works: [], // DBから取得した全データを格納
      myTable: null,
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
        const works_all = await getDocs(workCollRef);

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
      return this.csv_data===null? true : false;
    },
    disabled2: function() {
      return this.csv_data2===null? true : false;
    }
	},
  methods: {
    // ホームボタンを押したときの関数
    goToHome() {
      this.$router.push('/room')
    },

    /**
     * store経由でuserにアラートを数秒提示する関数．
     * @param {string} text - アラートに表示する内容．
     * @param {number} risk - アラートの色を指定する1が緑,2が黄色,3が赤
     */
    message(text, risk) {
      this.$store.commit("addMessage", {
        text: text,
        risk: risk,
      });
    },

    /**
     * 一括編集ボタン押下時に実行され，myTableを最新状態に書き換えて表示する.
     */
    change_data_file() {
      this.dialog_file = true;
      //処理が前後するとid=mytableの要素がとれないエラーが発生するため，
      //以下のようにsetTimeOutで時間差を作っている．
      setTimeout(() => {
        //子要素の全消し
        let parent = document.getElementById('mytable')
        if ('cloneNode' in parent) {
          const cloneParent = parent.cloneNode(false) //外側だけ複製
          parent.parentNode.replaceChild(cloneParent, parent)
        }
        //worksからmyTable_dataを形成
        const myTable_data = [];
        this.works.forEach(work => {
          myTable_data.push([work.content, work.price])
        })
        //jspreadsheetに転記
        const myTable = jspreadsheet(document.getElementById('mytable'), {
          data: myTable_data,
          columns: this.columns,
          contextMenu: function(obj, row, event, section) {
            let items = [];
            // Insert new row
            items.push({
              title: T('新しい行を追加'),
              onclick: function() {
                obj.insertRow(1, parseInt(row), 1); //要修正
              }
            });
            items.push({
              title: T('行の削除'),
              onclick: function() {
                obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
              }
            });
            // Save
            items.push({
              title: T('保存'),
              icon: 'save',
              shortcut: 'Ctrl + S',
              onclick: function () {
                obj.download();
              }
            });
            return items;
          },
          toolbar: [
            {
              type: 'i',
              content: 'undo',
              onclick: function() {myTable.undo()}
            },
            {
              type: 'i',
              content: 'redo',
              onclick: function() {myTable.redo()}
            },
            {
              type: 'i',
              content: 'save',
              onclick: ()=>{this.save_data()}
            },
            {
              type: 'i',
              content: 'close',
              onclick: ()=>{
                this.dialog_file=false;
                // ここでmyTableのデータを削除する処理を入れるかどうか.
              }
            },
          ],
        });
        this.myTable = myTable;
      }, 100)
    },

    /**
     * jspreadsheetでの保存ボタンを押下時に実行される関数.
     */
    async save_data() {
      /**
       * myTableに記録されている[内容,報酬]の配列の全データ．
       * @type {Array<TableRow>}
       */
      const modified_data = this.myTable.getData();
      /**
       * DBに登録されているworksの全データを取得．
       * @type {Array<Work>}
       */
      const original_data = this.works;

      if (this.check_content_is_duplicate(modified_data)) {
        this.message('入力に重複する内容が含まれています．', 3);
      }
      else {
        //ここに空白チェック関数を入れる．
        if (this.check_missing_entries_myTable(modified_data)) {
          this.message('入力に漏れがあります．', 3);
        }
        else {
          await this.create_and_update_works_by_myTable(original_data, modified_data)
          await this.delete_works_by_myTable(original_data, modified_data)
          await this.fetch_works();
          this.dialog_file = false;
        }
      }
    },

    /**
     * 一括編集機能を行う前に，myTableに同一名のお仕事が重複して登録されていないかを確認する関数．
     * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
     * @returns {boolean} - コンテンツ名が重複していればTrue，いなければFalseを返す.
     */
    check_content_is_duplicate(modified_data) {
      const modified_data_length = modified_data.length
      for (let i = 0; i < modified_data_length; i++) {
        let content_is_duplicate = false;
        for (let j = 0; j < modified_data_length; j++) {
          if ((i !== j)&&(modified_data[i][0]===modified_data[j][0])) {
            content_is_duplicate = true;
          }
        }
        if (content_is_duplicate) {
          return content_is_duplicate;
        }
      }
      return false;
    },

    /**
     * 一括編集機能を行う前に，myTableに記入漏れがないかを確認する関数.
     * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
     * @returns {boolean} - 内容に記入漏れがないかを確認し，あればTrue，なければFalseを返す.
     * @description modified_dataの内，両方が空白のものは記入漏れとみなさない．
     * 片方が記入されているが，もう片方が空白のもののみ記入漏れとみなし，Trueを返す．
     */
    check_missing_entries_myTable(modified_data) {
      for (let i = 0; i < modified_data.length; i++) {
        const content_isEmpty = modified_data[i][0].trim() === '';
        const price_isEmpty = String(modified_data[i][1]).trim() === '';
        if (content_isEmpty || price_isEmpty) {
          if (!(content_isEmpty && price_isEmpty)) {
            return true;
          } 
        }
      }
      return false;
    },

    /**
     * 一括編集機能として，「DB上の保存済みデータとmyTableの差分を新規追加または報酬のみ変更」する関数.
     * @param {Array<Work>} original_data - DB上のWorkに登録されているデータ．
     * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
     */
    async create_and_update_works_by_myTable(original_data, modified_data) {
      for (let i = 0; i < modified_data.length; i++) {
        let modified_content_isExist = false;
        for (let j = 0; j < original_data.length; j++) {
          // contentがある場合は変更の可能性がある．
          if (original_data[j].content === modified_data[i][0]) {
            modified_content_isExist = true;
            // contentはあるが，priceが変更されている場合 => priceのみupdate.
            // そうでなければ，どっちも変わってないのでそのままにする．
            if (original_data[j].price !== modified_data[i][1]) {
              const docid = original_data[j].id;
              const docRefForUpdate = doc(fireStore, 'groups', this.roomPath, 'works', docid);
              try {
                await updateDoc(docRefForUpdate, {
                  price: Number(modified_data[i][1])
                })
                await saveHistory(this.roomPath, this.user.uid,
                  `${this.user.displayName}が『お手伝い』の${original_data[j].content}を修正しました`
                )
              }
              catch(e) {
                const error_message = '『'+String(e) + '』が発生しました';
                this.message(error_message, 3)
              }
            }
          }
        }
        // myTableにしか載っていないcontentを新規データとしてDBに登録する
        if (!modified_content_isExist) {
          // 既に空白チェック済みなので，contentが空白かどうかをみれば，両方が空白かどうかは判断がつく．
          if (!(modified_data[i][0].trim() === '')) {
            try {
              await addDoc(this.workCollRef, {
                content: String(modified_data[i][0]),
                price: Number(modified_data[i][1]),        
              })
              await saveHistory(this.roomPath, this.user.uid, 
                `${this.user.displayName}が${String(modified_data[i][0])}を『お手伝い』に追加しました`
              )
            }
            catch(e) {
              const error_message = '『'+String(e) + '』が発生しました';
              this.message(error_message, 3)
            }
          }
        }
      }
    },

    /**
     * 一括編集機能として，「DB上の保存済みデータにあるが，myTableにないデータを削除する」関数.
     * @param {Array<Work>} original_data - DB上のWorkに登録されているデータ．
     * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
     */
    async delete_works_by_myTable(original_data, modified_data) {
      for (let i = 0; i < original_data.length; i++) {
        let original_content_isExist = false;
        for (let j = 0; j < modified_data.length; j++) {
          if (original_data[i].content === modified_data[j][0]) {
            original_content_isExist = true;
          }
        }
        //myTableにはなくなっていて，DBにだけ残ってるデータを削除する．
        if (!original_content_isExist) {
          const docid = original_data[i].id; 
          try {
            await deleteDoc(doc(fireStore, "groups", this.roomPath, "works", docid));
            await saveHistory(this.roomPath, this.user.uid, 
              `${this.user.displayName}が${original_data[i].content}を『お手伝い』から削除しました`
            )
          }
          catch(e) {
            const error_message = '『'+String(e) + '』が発生しました';
            this.message(error_message, 3)
          }
        }
      }
    },

    //tableに登録するアイテムの作成 作成は一つずつ
    async create_item() { 
      let flag = this.data_check(this.content, this.price)
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
  
    //既にtableに登録されているアイテムのうち選択したものを削除
    async delete_items(){ 
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
    // DBからworksを再取得するための関数(主に，データ更新時に利用する)
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
        }
        catch(error) {
          console.log(error);
        }
        
      })
    },
    //DBの登録前にcontent(内容)とprice(報酬)の入力内容を簡易的にチェックする関数
    data_check(content, price) {
      let flag = true;
      if (!this.is_written(content, price)) {
        flag = false;
        this.$store.commit("addMessage", {
          text: `記入漏れがあります`,
          risk: 3,
        });
      }
      else if (!this.is_long(content)) {
        flag = false;
        this.$store.commit("addMessage", {
          text: `内容の説明が短いです`,
          risk: 3,
        });
      }
      else if (!func.isNumber(price)) {
        flag = false;
        this.$store.commit("addMessage", {
          text: `金額は半角数字で入力してください`,
          risk: 3,
        });
      }
      return flag
    },
    // DBの登録前にcontetnとpriceの入力内容をチェックする関数(data_check内で利用する)
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
    },

    /**
     * jspreadSheetでのコンテキストメニューを作る際に内部で使用しているTitle作成関数
     * @param {string} t - タイトルを書く．e.g. save as や insert new row など
     * @returns {string} - 正直良く分からん．とりあえず，Titleように変換してくれるっぽい．
     */
    T(t) {
      return jSuites.translate(t);
    },
    save() {console.log('save')},
    cancel() {},
    open() {},
    close() {},
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