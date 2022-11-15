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
                  step="5"
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
  name: 'fineParentPage',
  layout: "default",

  data() {
    return {
      dialog: false,
      main_dialog: true,
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
    }
  }
})
</script>
<style scoped>
.input_case {
  font-family: 'serif'
}
</style>