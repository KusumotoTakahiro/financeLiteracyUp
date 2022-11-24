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
							text--lighten-3
							"
						border="bottom"
						colored-border
						color="blue accent-5"
						elevation="2"
					> 現在の罰則一覧
					</v-alert>
				</div>
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
            <v-btn class="mx-auto mb-1" width="7rem" @click="dialog_2=true">
              一括追加
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
      <v-dialog
        v-model="c_dialog_2"
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
                        罰則を変更
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
                        罰金を変更
                      </div>
                      <v-text-field
                        v-model="props.item.price"
                        label="Edit"
                        single-line
                        counter
                        autofocus
                        type="Number"
                        class=" text-center"
                        style="font-family: serif;"
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
          <v-card-actions class="justify-end">
            <v-btn
              text
              @click="c_dialog_2 = false"
            >Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
          <v-card-title class="justify-center">CSVから一括追加</v-card-title>
          <v-card-text>
            <template>
              <div>
                <v-file-input
                  id="file"
                  ref="file"
                  show-size
                  accept=".csv"
                  @change="onFileChange"
                  @click:clear="csv_data=null"
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
                  @click="check_csv()"
                >CSVから登録</v-btn>
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
        :height="$vuetify.breakpoint.height"
        max-width="600"
        hide-overlay
        outlined
        content-class="rounded-lg elevation-0"
        transition="dialog-bottom-transition"
      >
        <v-card 
          class="py-5"
          elevation="7"
          outlined
          shaped
        >
          <v-card-title class="justify-center">罰則項目追加</v-card-title>
          <v-card-text>
            <template>
              <div>
                <div class="form-header">内容</div>
                <v-text-field
                  v-model="content"
                  clearable
                  placeholder="罰則の内容を記入してください"
                  dense
                  color=""
                  outlined
                  type="text"
                  hide-details=""
                  class="input_case"
                ></v-text-field>
              </div>
              <div>
                <div class="form-header">罰金</div>
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
  name: 'fineParentPage',
  layout: "default",

  data() {
    return {
      dialog: false,
      dialog_2: false,
      c_dialog_2: false,
      main_dialog: true,
      csv_data: null,
      new_csv:[],
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
      fines: []
    }
  },
  async mounted() {
    let user = await authStateChanged();
    console.log(user);
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
        const fines_all = await getDocs(fineCollRef);
        console.log(fines_all)
        fines_all.forEach(doc => {
          //ここでfinesを更新する =>データがテーブルに反映されるはず
          let data = doc.data();
          data.id = doc.id;
          this.fines.push(data);
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
    }
  },
  methods: {
    goToHome() {
      this.$router.push('/room')
    },
    async create_item() { //tableに登録するアイテムの作成
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
          text: `内容の説明が短いです`,
          risk: 3,
        });
      }
      if (flag) {
        try {
          await addDoc(this.fineCollRef, {
            content: this.content,
            price: this.price,        
          })
          await saveHistory(this.roomPath, this.user.uid, 
            `${this.user.displayName}が${this.content}を『罰則』に追加しました`
          )
        }
        catch(error) {
          console.log('create_item error');
          console.log(error);
        }
        this.dialog = false;
        this.content = "";
        this.price = null;
        this.fetch_fines();
      }
    },
    async delete_items(){ //既にtableに登録されているアイテムのうち選択したものを削除
      let obj = this.selected;
      for(let key in obj ) {
        if( obj.hasOwnProperty(key) ) {
          try {
            await deleteDoc(doc(fireStore, "groups", this.roomPath, "fines", obj[key].id));
            await saveHistory(this.roomPath, this.user.uid, 
              `${this.user.displayName}が${obj[key].content}を『罰則』から削除しました`
            )
          }
          catch(error) {
            console.log(error)
          }
        }
      }
      await this.fetch_fines();
    },
    async fetch_fines() {
      console.log('fetch_fines')
      const fines_all = await getDocs(this.fineCollRef);
      this.fines = [];
      fines_all.forEach(doc => {
        //ここでfinesを更新する =>データがテーブルに反映されるはず
        try {
          let data = doc.data();
          data.id = doc.id;
          this.fines.push(data);
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
    },
    download_format() {
      console.log('format_download');
      //文字列型の二次元配列データ
      const data = [
        ["content", "price"],
        ["嘘をつく（例）", "80"],
        ["22時に寝ない（例）", "100"]
      ]

      //作った二次元配列をCSV文字列に直す．
      let csv_string = "";
      for (let d of data) {
        csv_string += d.join(",");
        csv_string += '\r\n';
      }

      //ファイル名
      const file_name = "format.csv";

      //BOMを作る これをしないと文字化けした
      var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);

      //CSVのバイナリデータを作る
      const blob = new Blob([bom, csv_string], {type: "text/csv"});
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = file_name;
      link.href = url;
      link.click(); //リンクをクリックしたことにする．
      URL.revokeObjectURL(link.href); //リンクに当てられたメモリを開放する
    },

    //現在のCSVデータに記入ミスがないかを確認表示する関数
    check_csv() {
      console.log('check_csv');
      const vm = this;
      vm.new_csv = []; //前のデータを空にする
      this.c_dialog_2 = true;
      //登録の際の記入ミスがないかをチェック
      vm.csv_data.forEach((data, index) => {
        if (!this.is_written(data.content, data.price)) {
          this.$store.commit("addMessage", {
            text: `${index+1}行目に記入漏れがあります`,
            risk: 3,
          });
        }
        else if (!this.is_long(data.content)) {
          this.$store.commit("addMessage", {
            texat: `${index+1}行目の内容の説明が短いです`,
            risk: 3,
          });
        }
        data.id = index;
        this.new_csv.push(data);
      })
    },

    //最終的に，「登録する」ボタンを押すと実行される
    async create_items_from_csv() {
      console.log('create_items_from_csv');
      let vm = this;
      const data = vm.new_csv;
      const length = data.length;
      console.log(data);
      console.log(length);
      for (let i = 0; i < length; i++) {
        await this.create_item_for_csv(data[i].content, data[i].price);
      }
      this.fetch_fines();
      this.c_dialog_2 = false;
      this.dialog_2 = false;
    },
    //create_items_from_csv内で実行される関数
    async create_item_for_csv(content, price) { 
      console.log('create_item_for_csv');
      console.log(content, price);
      try {
        await addDoc(this.fineCollRef, {
          content: String(content),
          price: Number(price),        
        })
        await saveHistory(this.roomPath, this.user.uid, 
          `${this.user.displayName}が${content}を『罰則』に追加しました`
        )
      }
      catch(error) {
        console.log('create_item error');
        console.log(error);
      }
      this.new_csv = []; //登録終わったので空にする
    },
    //fileがUploadされたときにcsv_dataを更新する(csv_dataを取り込む)
    onFileChange(file) {
      const vm = this;
      if (file) {
        if (file.name.indexOf('.csv') > -1) {
          vm.get_csv_data(file)
          .then(vm.process_csv_data)
        }
      }
      else {
        console.log('not in file');
      }
    },
    //fileReaderにファイルが読み込まれた時の処理．
    get_csv_data(file) {
      return new Promise((resolve, reject) => {
        console.log('get_csv_data');
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split('\r\n'));
        reader.onerror = () => reject(error);
        reader.readAsText(file);
      })
    },
    //fileReaderの読み込んだファイルを扱えるデータとして読み込む処理.
    process_csv_data(res) {
      console.log('process_csv_data');
      let vm = this;
      let result = res;
      let header = result[0].split(',')
      result.shift();
      result.pop();
      vm.csv_data = result.map(item=>{
        let datas = item.split(',');
        let temp = {};
        for (const index in datas) {
          let key = header[index];
          temp[key] = datas[index];
        }
        return temp;
      })
    },
    save() {console.log('save')},
    cancel() {},
    open() {},
    close() {},
  }
})
</script>
<style scoped>
.input_case {
  font-family: 'serif'
}
</style>