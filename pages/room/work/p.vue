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
          mask:'#,##' //maskは形式の指定 #,##で書式を指定している
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
        //worksからdataを形成
        const data = []
        this.works.forEach(work => {
          data.push([work.content, work.price])
        })
        //jspreadsheetに転記
        const myTable = jspreadsheet(document.getElementById('mytable'), {
          data: data,
          columns: this.columns,
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
              onclick: ()=>{this.dialog_file=false}
            },
          ],
        });
        this.myTable = myTable;
      }, 500)
    },

    //jspreadsheetでの変更時に起動する関数
    async save_data() {
      const myTableData = this.myTable.getData();
      const length = myTableData.length;
      const works = this.works;
      let content_exist = false;
      for (let i = 0; i < length; i++) {
        for (let j = 0; j < works.length; j++) {
          if (works[j].content === myTableData[i][0]) {
            content_exist = true;
            if (works[j].price !== myTableData[i][1]) {
              console.log(myTableData[i][0], 'のpriceを変更する')
            }
          }
        }
      }
      for (let i = 0; i < works.length; i++) {
        let work_exist = false
        for (let j = 0; j < length; j++) {
          if (works[i].content === myTableData[j][0]) {
            work_exist = true
          }
        }
        if (!work_exist) {
          console.log(works[i].content, 'を削除する')
        }
      }
      // try {
      //   await addDoc(this.workCollRef, {
      //     content: String(content),
      //     price: Number(price),        
      //   })
      //   await saveHistory(this.roomPath, this.user.uid, 
      //     `${this.user.displayName}が${content}を『お手伝い』に追加しました`
      //   )
      // }
      // catch(error) {
      //   console.log('create_item error');
      //   console.log(error);
      // }
      // this.fetch_works();
      // //本来は誤操作防止のため，dialogはあとで閉じたほうがいいはず
      // this.dialog_file = false;
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
    // 今回は使わなくなったファイル処理ですが，結構調べるのには，苦労したので，一旦コメントアウトで残しておきます．
    // あとで，Notionに移しておこうと思います．
    // download_format() {
    //   console.log('format_download');
    //   //文字列型の二次元配列データ
    //   const data = [
    //     ["content", "price"],
    //     ["皿洗い（例）", "80"],
    //     ["掃除（例）", "100"]
    //   ]
    //   //作った二次元配列をCSV文字列に直す．
    //   let csv_string = "";
    //   for (let d of data) {
    //     csv_string += d.join(",");
    //     csv_string += '\r\n';
    //   }
    //   //ファイル名
    //   const file_name = "format.csv";
    //   //BOMを作る これをしないと文字化けした
    //   var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    //   //CSVのバイナリデータを作る
    //   const blob = new Blob([bom, csv_string], {type: "text/csv"});
    //   const url = URL.createObjectURL(blob);
    //   const link = document.createElement("a");
    //   link.download = file_name;
    //   link.href = url;
    //   link.click(); //リンクをクリックしたことにする．
    //   URL.revokeObjectURL(link.href); //リンクに当てられたメモリを開放する
    // },
    // ファイル処理関連の関数　上記と同様です．
    // download_now() {
    //   console.log('download_now');
    //   //文字列型の二次元配列データ
    //   const data = [["content", "price", "id"]]
    //   //dataを今のテーブルをもとに生成する.
    //   for (let i = 0; i < this.works.length; i++) {
    //     let work = this.works[i];
    //     data.push([work.content, work.price, work.id]);
    //   }
    //   //作った二次元配列をCSV文字列に直す．
    //   let csv_string = "";
    //   for (let d of data) {
    //     csv_string += d.join(",");
    //     csv_string += '\r\n';
    //   }
    //   //ファイル名
    //   const file_name = "works.csv";
    //   //BOMを作る これをしないと文字化けした
    //   var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    //   //CSVのバイナリデータを作る
    //   const blob = new Blob([bom, csv_string], {type: "text/csv"});
    //   const url = URL.createObjectURL(blob);
    //   const link = document.createElement("a");
    //   link.download = file_name;
    //   link.href = url;
    //   link.click(); //リンクをクリックしたことにする．
    //   URL.revokeObjectURL(link.href); //リンクに当てられたメモリを開放する
    // },
    //ファイル処理の関数．上記と同様です．
    //現在のCSVデータに記入ミスがないかを確認表示する関数
    // check_csv() {
    //   console.log('check_csv');
    //   const vm = this;
    //   vm.new_csv = []; //前のデータを空にする
    //   this.c_dialog_file = true;
    //   //登録の際の記入ミスがないかをチェック
    //   vm.csv_data.forEach((data, index) => {
    //     if (!this.is_written(data.content, data.price)) {
    //       this.$store.commit("addMessage", {
    //         text: `${index+1}行目に記入漏れがあります`,
    //         risk: 3,
    //       });
    //     }
    //     else if (!this.is_long(data.content)) {
    //       this.$store.commit("addMessage", {
    //         texat: `${index+1}行目の内容の説明が短いです`,
    //         risk: 3,
    //       });
    //     }
    //     data.id = index;
    //     this.new_csv.push(data);
    //   })
    // },

    //一括修正用
    // check_csv2() {
    //   console.log('check_csv2');
    //   const vm = this;
    //   vm.new_csv2 = []; //前のデータを空にする
    //   vm.c_dialog_3 = true;
    //   //ファイル形式のチェック
    //   let msg = func.checkFile(vm.csv_data2, vm.works)
    //   if (msg!=="") {
    //     this.$store.commit("addMessage", {
    //       text: msg,
    //       risk: 3,
    //     });
    //     vm.c_dialog_3 = false;
    //     return;
    //   } 

    //   let flag = true;
    //   //登録の際の記入ミスがないかをチェック
    //   vm.csv_data2.forEach((data, index) => {
    //     if (!vm.is_written(data.content, data.price)) {
    //       vm.$store.commit("addMessage", {
    //         text: `${index+1}行目に記入漏れがあります`,
    //         risk: 3,
    //       });
    //       flag = false;
    //     }
    //     else if (!vm.is_long(data.content)) {
    //       vm.$store.commit("addMessage", {
    //         text: `${index+1}行目の内容の説明が短いです`,
    //         risk: 3,
    //       });
    //       flag = false;
    //     }
    //     else if (!func.isNumber(data.price)) {
    //       vm.$store.commit("addMessage", {
    //         text: `金額が半角数字ではありません`,
    //         risk: 3,
    //       });
    //       flag = false;
    //     }
    //     if (flag) {
    //       data.id = index;
    //       vm.new_csv2.push(data);
    //     }
    //     else {
    //       vm.c_dialog_3 = false;
    //     }
    //   })
    // },

    //create_items_from_csv内で実行される関数
    // async create_item_for_csv(content, price) { 
    //   console.log('create_item_for_csv');
    //   console.log(content, price);
    //   try {
    //     await addDoc(this.workCollRef, {
    //       content: String(content),
    //       price: Number(price),        
    //     })
    //     await saveHistory(this.roomPath, this.user.uid, 
    //       `${this.user.displayName}が${content}を『お手伝い』に追加しました`
    //     )
    //   }
    //   catch(error) {
    //     console.log('create_item error');
    //     console.log(error);
    //   }
    //   this.new_csv = []; //登録終わったので空にする
    // },

    //最終的に，「修正する」ボタンを押すと実行される
    // async update_items_from_csv() {
    //   console.log('update_items_from_csv');
    //   let vm = this;
    //   const data = vm.new_csv2;
    //   const length = data.length;
    //   //本来は誤操作防止のため，dialogはあとで閉じたほうがいいが，
    //   this.c_dialog_3 = false;
    //   this.dialog_3 = false;
    //   //DBへの登録が先だとブラウザ側で少しタイムラグになるので，先にdialogを閉じる.
    //   for (let i = 0; i < length; i++) {
    //     await this.update_item_for_csv(data[i].content, data[i].price, data[i].did);
    //   }
    //   this.fetch_works();
    // },
    //update_items_from_csv内で実行される関数
    // async update_item_for_csv(content, price, did) { 
    //   console.log('update_item_for_csv');
    //   try {
    //     const Ref = doc(fireStore, "groups", this.roomPath, "works", did);
    //     await updateDoc(Ref, {
    //       content: String(content),
    //       price: Number(price),        
    //     })
    //     await saveHistory(this.roomPath, this.user.uid, 
    //       `${this.user.displayName}が『お手伝い』の${content}を修正しました`
    //     )
    //   }
    //   catch(error) {
    //     console.log('update_item error');
    //     console.log(error);
    //   }
    //   this.new_csv2 = []; //登録終わったので空にする
    // },

    //fileがUploadされたときにcsv_dataを更新する(csv_dataを取り込む)
    // onFileChange(file) {
    //   const vm = this;
    //   if (file) {
    //     if (file.name.indexOf('.csv') > -1) {
    //       vm.get_csv_data(file)
    //       .then(vm.process_csv_data)
    //     }
    //   }
    //   else {
    //     console.log('not in file');
    //   }
    // },
    // //fileReaderにファイルが読み込まれた時の処理．
    // get_csv_data(file) {
    //   return new Promise((resolve, reject) => {
    //     console.log('get_csv_data');
    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //       //uint8arrayにより数値配列に変換できる．＝＞detect()で扱える形になるから嬉しいってこと．
    //       let codes = new Uint8Array(e.target.result);
    //       let encoding = Encoding.detect(codes);
    //       let unicodeString = Encoding.convert(codes, {
    //         to: 'unicode',
    //         from: encoding,
    //         type: 'string'
    //       })
    //       this.encoding = encoding;
    //       resolve(unicodeString.split(/\r\n|\n/)) 
    //     };
    //     reader.onerror = () => reject(error);
    //     reader.readAsArrayBuffer(file); //これはfileの中身をbinaryのまま扱えるようにする関数
    //     //reader.readAsText(file); //これはfileの中身をstring型で扱えるようにする関数
    //   })
    // },
    // //fileReaderの読み込んだファイルを扱えるデータとして読み込む処理.
    // process_csv_data(res) {
    //   console.log('process_csv_data');
    //   let vm = this;
    //   let result = res;
    //   //let header = result[0].split(',')
    //   //理由はわからないが，上記だと文字が表示されない
    //   let header = ['content', 'price']; 
    //   result.shift(); //headerの部分を削除
    //   result.pop(); //最後に不要な空白が残っているのでその部分を削除
    //   vm.csv_data = result.map(item=>{
    //     let datas = item.split(',');
    //     let temp = {};
    //     for (const index in datas) {
    //       let key = header[index];
    //       temp[key] = datas[index];
    //     }
    //     return temp;
    //   })
    // },
    // //一括修正用
    // onFileChange2(file) {
    //   const vm = this;
    //   if (file) {
    //     if (file.name.indexOf('.csv') > -1) {
    //       vm.get_csv_data(file)
    //       .then(vm.process_csv_data2)
    //     }
    //   }
    //   else {
    //     console.log('not in file');
    //   }
    // },
    // process_csv_data2(res) {
    //   console.log('process_csv_data');
    //   let vm = this;
    //   let result = res;
    //   //let header = result[0].split(',')
    //   //理由はわからないが，上記だと文字が表示されない
    //   let header = ['content', 'price', 'did']; 
    //   result.shift(); //headerの部分を削除
    //   result.pop(); //最後に不要な空白が残っているのでその部分を削除
    //   vm.csv_data2 = result.map(item=>{
    //     let datas = item.split(',');
    //     let temp = {};
    //     for (const index in datas) {
    //       let key = header[index];
    //       temp[key] = datas[index];
    //     }
    //     return temp;
    //   })
    // },
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