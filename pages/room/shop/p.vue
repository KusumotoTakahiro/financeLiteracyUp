<template>
  <v-row>
    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
      <v-dialog
        v-model="dialog"
        :height="$vuetify.breakpoint.height - 100"
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
          <v-card-title class="justify-center">商品追加</v-card-title>
          <v-card-text>
            <template>
              <div>
                <div class="form-header">商品</div>
                <v-text-field
                  v-model="content"
                  clearable
                  placeholder="商品の内容を記入してください"
                  dense
                  color=""
                  outlined
                  type="text"
                  hide-details=""
                  class="input_case"
                ></v-text-field>
              </div>
              <div>
                <div class="form-header">価格</div>
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
      <v-alert class="justify-center text-center text-h5"> 現在の商品一覧 </v-alert>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="shops"
        :single-select="false"
        item-key="content"
        show-select
        class="elevation-1"
        fixed-header
        :height="$vuetify.breakpoint.height - 250"
      ></v-data-table>
    </v-col>
    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
      <v-row>
        <v-btn class="mx-auto" width="10rem" @click="dialog=true">
          追加
        </v-btn>
        <v-btn class="mx-auto" width="10rem" @click="delete_items()">
          削除
        </v-btn>
      </v-row>
      <v-row>
        <v-btn
          class="ml-auto"
          height="40"
          color=""
          @click="goToHome()"
        >Homeに戻る</v-btn>
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

export default ({
  name: 'shopParentPage',
  layout: "default",

  data() {
    return {
      dialog: false,
      content: "",
      price: null,
      isLogin: false,
      roomPath: null,
      shopCollRef: null,
      selected: [],
      headers: [
        {
          text: '商品',
          align: 'start',
          sortable: false,
          value: 'content',
        },
        {
          text: '価格（パパ円）',
          value: 'price'
        }
      ],
      shops: []
    }
  },
  async mounted() {
    let user = await authStateChanged();
    console.log(user);
    if (user.uid) {
      this.isLogin=true;
      try {
        //ログインユーザの情報から所属するグループのshopsの参照を取得
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        const roomPath = querySnapshot.data().group;
        this.roomPath = roomPath;
        const shopCollRef = collection(fireStore, "groups", roomPath, "shops")
        this.shopCollRef = shopCollRef;
        
        //参照の中からshopsを取得して，shops(collection)の中のdocumentを全取得
        const shops_all = await getDocs(shopCollRef);
        console.log(shops_all)
        shops_all.forEach(doc => {
          //ここでshopsを更新する =>データがテーブルに反映されるはず
          this.shops.push(doc.data())
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
          const shopRef = await addDoc(this.shopCollRef, {
            content: this.content,
            price: this.price,        
          })
        }
        catch(error) {
          console.log('create_item error');
          console.log(error);
        }
        this.dialog = false;
        this.content = "";
        this.price = null;
        this.fetch_shops();
      }
    },
    async delete_items(){ //既にtableに登録されているアイテムのうち選択したものを削除
      let obj = this.selected;
      for(let key in obj ) {
        if( obj.hasOwnProperty(key) ) {
          try {
            await deleteDoc(doc(fireStore, "groups", this.roomPath, "shops", obj[key].id));
          }
          catch(error) {
            console.log(error)
          }
        }
      }
      await this.fetch_shops();
    },
    async fetch_shops() {
      console.log('fetch_shops')
      const shops_all = await getDocs(this.shopCollRef);
      this.shops = [];
      shops_all.forEach(doc => {
        //ここでshopsを更新する =>データがテーブルに反映されるはず
        try {
          let data = doc.data();
          data.id = doc.id;
          this.shops.push(data);
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