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
          elevation="2"> 現在のご褒美一覧 
        </v-alert>
      </div>
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
                  class="pb-0"
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
import { fromStringWithSourceMap } from "source-list-map";

export default ({
  name: 'presentParentPage',
  layout: "default",

  data() {
    return {
      dialog: false,
      main_dialog: true,
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
      presents: []
    }
  },
  async mounted() {
    let user = await authStateChanged();
    console.log(user);
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
        const presents_all = await getDocs(presentCollRef);
        console.log(presents_all)
        presents_all.forEach(doc => {
          //ここでpresentsを更新する =>データがテーブルに反映されるはず
          let data = doc.data();
          data.id = doc.id;
          this.presents.push(data);
        })

        //自分のグループに参加しているchildユーザを全取得
        try {
          const memberCollRef = collection(fireStore, "groups", roomPath, "member");
          this.memberCollRef = memberCollRef;
          const member = await getDocs(memberCollRef);
          console.log(member);
          const children = []
          member.forEach(doc => {
            if (doc.data().attribute==="child") {
              children.push(doc.data());
              console.log(doc.data())
            }
          })
          try {
            for (let i = 0; i < children.length; i++) {
              const childRef = doc(fireStore, "users", children[i].uid);
              const childData = await getDoc(childRef);
              let child = {}
              child.data = childData.data();
              child.uid = children[i].uid;
              this.children.push(child);
            }
          }
          catch (error) {
            console.log('分割してみた')
            console.log(error);
          }
        }
        catch (error) {
          console.log('memberが取得できなかったエラー');
          console.log(error);
        }
      }
      catch(error) {
        console.log('presentsが取得できなかったエラー');
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
    chip_delete(uid) {
      console.log('chip_delete');
      let newary = this.forWhom.filter(one => one.uid !== uid)
      this.forWhom = newary;
    },
    async create_item() { //tableに登録するアイテムの作成
      let flag = true;
      if (!this.is_written(this.content, this.price, this.forWhom)) {
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
          for (let i = 0; i < this.forWhom.length; i++) {
            let forWhom = this.forWhom[i];
            const presentRef = await addDoc(this.presentCollRef, {
              content: this.content,
              price: this.price,  
              forWhom: { 
                name: forWhom.data.name,
                uid: forWhom.uid,
                attribute: forWhom.data.attribute //属性は確認用,
              }      
            })
            await saveHistory(this.roomPath, this.user.uid, 
              `${this.user.displayName}が${forWhom.data.name}を対象に，${this.content}を『ご褒美』に追加しました`
            )
          }
          
        }
        catch(error) {
          console.log('create_item error');
          console.log(error);
        }
        this.dialog = false;
        this.content = "";
        this.price = null;
        this.fetch_presents();
      }
    },
    async delete_items(){ //既にtableに登録されているアイテムのうち選択したものを削除
      let obj = this.selected;
      for(let key in obj ) {
        if( obj.hasOwnProperty(key) ) {
          console.log(obj[key])
          console.log(obj)
          try {
            await deleteDoc(doc(fireStore, "groups", this.roomPath, "presents", obj[key].id));
            await saveHistory(this.roomPath, this.user.uid, 
              `${this.user.displayName}が${obj[key].content}を『ご褒美』から削除しました`
            )
          }
          catch(error) {
            console.log(error)
          }
        }
      }
      await this.fetch_presents();
    },
    async fetch_presents() {
      console.log('fetch_presents')
      const presents_all = await getDocs(this.presentCollRef);
      this.presents = [];
      presents_all.forEach(doc => {
        //ここでpresentsを更新する =>データがテーブルに反映されるはず
        try {
          let data = doc.data();
          data.id = doc.id;
          this.presents.push(data);
          console.log(data);
        }
        catch(error) {
          console.log(error);
        }
        
      })
    },
    is_written(content, price, forWhom) {
      let ok = true;
      if (!content) {
        ok = false;
      }
      if (!price) {
        ok = false;
      }
      if (forWhom.length === 0) {
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