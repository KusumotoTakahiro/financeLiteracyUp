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
          <v-card-title class="justify-center">お手伝い追加</v-card-title>
          <v-card-text>
            <template>
              <div>
                <div class="form-header">内容</div>
                <v-text-field
                  v-model="content"
                  clearable
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
      <v-alert class="justify-center text-center text-h5"> 現在のお手伝い一覧 </v-alert>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="works"
        :single-select="false"
        item-key="name"
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
} from "firebase/firestore";
import {
  fireStore,
} from "~/plugins/firebase";
import {authStateChanged} from '@/plugins/auth'

export default ({
  name: 'workParentPage',
  layout: "default",

  data() {
    return {
      dialog: false,
      content: "",
      price: 0,
      selected: [],
      headers: [
        {
          text: 'お手伝い',
          align: 'start',
          sortable: false,
          value: 'name',
        },
        {
          text: '報酬',
          value: 'price'
        }
      ],
      works: [
        {
          name:'ごみ捨て',
          price:100,
        },
        {
          name:'食洗器をまわす',
          price:50,
        },
        {
          name:'食洗器を片づける',
          price:20,
        },
        {
          name:'トイレ床掃除',
          price:50,
        },
        {
          name:'トイレ便器掃除',
          price:50,
        },
        {
          name:'風呂湯舟掃除',
          price:20,
        },
        {
          name:'風呂床掃除',
          price:30,
        },
        {
          name:'リビング＋台所:掃除機',
          price:30,
        },
        {
          name:'リビング＋台所:雑巾',
          price:30,
        },
        {
          name:'階段+廊下掃除:雑巾',
          price:30,
        },
        {
          name:'子ども部屋モップ＋掃除機',
          price:50,
        },
        {
          name:'窓掃除一か所（二階は禁止）',
          price:10,
        },
        {
          name:'大人にお茶を作る',
          price:20,
        },
        {
          name:'料理の手伝い',
          price:50,
        },
        {
          name:'水補充(冷蔵庫，加湿器)',
          price:20,
        },
        {
          name:'洗濯物をたたんでしまう',
          price:50,
        },
      ]
    }
  },
  methods: {
    goToHome() {
      this.$router.push('/room')
    },
    create_item() { //tableに登録するアイテムの作成

    },
    delete_items(){ //既にtableに登録されているアイテムのうち選択したものを削除

    }
  }
})
</script>
<style scoped>
.input_case {
  font-family: 'serif'
}
</style>