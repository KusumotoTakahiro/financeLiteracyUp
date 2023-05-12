<template>
  <v-row align-content="center" justify="center">
    <v-col cols="12" xs="12" sm="12" md="12" lg="12" xl="12" align="center">
        <div v-if="attribute=='parent'">
          <v-card>
            <v-alert class="justify-center text-center text-h4">
              {{this.roomName}} 
            </v-alert>
          </v-card>
          <v-card
            class="
              d-flex 
              align-content-space-around
              flex-wrap 
              justify-center 
              mt-1
              "
            flat
            tile
            :height="$vuetify.breakpoint.height"
          >
          <template v-for="item in parentItems">
          <v-hover 
            v-slot="{ hover }" 
            :key="item.id"
            open-delay="50"
          >
            <v-card
              :key="item.id"
              :to="item.to"
              color=""
              outlined
              :width="width"
              :height="height"
              class="mx-6"
              :class="{ 'on-hover': hover }"
              :elevation="hover ? 12 : 4"
              style="background-color: white;"
            >
            <v-card-text class="my-auto" >
              <v-row justify="center">
                {{item.title}}
              </v-row>
              <v-row justify="center" class="mt-7">
                <v-icon :color="item.color" large>{{item.icon}}</v-icon>
              </v-row>
            </v-card-text>
            </v-card>
          </v-hover>
          </template>
          </v-card>
          
        </div>
        <div v-else-if="attribute=='child'">
          <v-card>
          <v-alert class="justify-center text-center text-h4"> {{this.roomName}} </v-alert>
          <v-alert class="jsutify-center text-center balance">
            <div class="d-inline text-body-2 mr-5">残高</div>
            <div class="d-inline text-h4">{{this.balance}}</div>
            <div class="d-inline text-body-2">パパ円</div>
          </v-alert>
          </v-card>
          <v-card
            class="
              d-flex 
              align-content-space-around 
              flex-wrap 
              justify-space-around
              mt-5
              "
            flat
            tile
            :height="$vuetify.breakpoint.height"
          >
          <template v-for="item in childItems">
            <v-hover
              v-slot="{hover}"
              :key="item.id"
              open-delay="50"
            >
              <v-card
                :key="item.id"
                :to="item.to"
                outlined
                :width="width"
                :height="height"
                class="mx-6"
                :class="{ 'on-hover' : hover}"
                :elevation="hover ? 12 : 4"
                style="background-color: white;"
              >
                <v-card-text class="my-auto">
                  <v-row justify="center">
                    {{item.title}}
                  </v-row>
                  <v-row justify="center" class="mt-10">
                    <v-icon :color="item.color" large>{{item.icon}}</v-icon>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-hover>
          </template>
          </v-card>
          
        </div>
        <div v-else>
          ログインセッションが切れています
          <v-row justify="center">
            <v-btn @click="$router.push('/login')">ログイン画面へ</v-btn>
          </v-row>
        </div>
      <!-- <div>user.attribute : {{attribute}}</div>
      <div>room.name : {{roomName}}</div> -->
    </v-col>
  </v-row>
</template>
<script>
import {getAuth} from 'firebase/auth'
import * as func from "~/plugins/myPlugins";
import {authStateChanged, userLogout} from '@/plugins/auth'
import { 
  fireStore,
} from '@/plugins/firebase'
import { 
  collection, 
  getDocs,
  getDoc, 
  doc,  
} from 'firebase/firestore'


export default {
  data() {
    return {
      userData: null,
      isLogin: false,
      attribute: "",
      userName: "",
      balance: 0,
      roomPath: null,
      roomName: null,
      myroomName: null,
      parentItems: [
        {
          icon: "mdi-hexagon-slice-3",
          title: "お手伝追加",
          to: `room/work/p`,
          color: "light-blue lighten-1",
          id: 1,
        },
        {
          icon: "mdi-basket",
          title: "ショップ追加",
          to: `room/shop/p`,
          color: "amber darken-1",
          id: 2,
        },
        {
          icon: "mdi-emoticon-angry-outline",
          title: "罰金追加",
          to: `room/fine/p`,
          color: "red lighten-1",
          id: 3,
        },
        {
          icon: "mdi-emoticon-outline",
          title: "ご褒美追加",
          to: `room/present/p`,
          color: "deep-orange lighten-3",
          id: 4
        },
        {
          icon: "mdi-comment-text-multiple",
          title: "自由記述",
          to: `room/communication/com`,
          color: "deep-orange lighten-3",
          id: 5
        },
        {
          icon: "mdi-cash-100",
          title: "タックス追加",
          to: `room/tax/p`,
          color: "brown lighten-3",
          id: 6
        },
        {
          icon: "mdi-alarm-note",
          title: "通知",
          to: `room/note`,
          color: "pink lighten-1",
          id: 7
        },
        {
          icon: "mdi-clipboard-text-clock",
          title: "履歴",
          to: `room/history/p`,
          color: "teal lighten-2",
          id: 8
        },
        {
          icon: "mdi-account-multiple-plus",
          title: "グループ招待",
          to: `room/invite`,
          color: "blue-grey darken-1",
          id: 9
        },
        {
          icon: "mdi-account-cog",
          title: "マイページ",
          to: `room/mypage`,
          color: "",
          id: 10
        },
        {
          icon: "mdi-cog-outline",
          title: "ルーム設定",
          to: `room/setting`,
          color: "blue-grey darken-1",
          id: 11
        },
        
      ],
      childItems: [
        {
          icon: "mdi-hexagon-slice-3",
          title: "お手伝い",
          to: `/room/work/c` ,
          color: "light-blue lighten-1",
          id: 1
        },
        {
          icon: "mdi-basket",
          title: "ショップ",
          to: `room/shop/c`,
          color: "amber darken-1",
          id: 2
        },
        {
          icon: "mdi-emoticon-angry-outline",
          title: "罰金",
          to: `room/fine/c`,
          color: "red lighten-1",
          id: 3
        },
        {
          icon: "mdi-emoticon-outline",
          title: "ご褒美",
          to: `room/present/c`,
          color: "deep-orange lighten-3",
          id: 4
        },
        {
          icon: "mdi-comment-text-multiple",
          title: "自由記述",
          to: `room/communication/com`,
          color: "deep-orange lighten-3",
          id: 5
        },
        {
          icon: "mdi-cash-100",
          title: "タックス",
          to: `room/tax/c`,
          color: "brown lighten-3",
          id: 6
        },
        {
          icon: "mdi-cash-plus",
          title: "貸す・借りる",
          to: `/room/loan`,
          color: "pink lighten-1",
          id: 7
        },
        {
          icon: "mdi-clipboard-text-clock",
          title: "履歴",
          to: `/room/history/c`,
          color: "teal lighten-2",
          id: 8
        },
        {
          icon: "mdi-account-cog",
          title: "マイページ",
          to: `room/mypage`,
          color: "",
          id: 9
        }
      ]
    }
  },
  computed: {
    user: function() { 
      return this.$store.getters.getUser; 
    },
    width: function() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return 130;
        case 'sm': return 200;
        case 'md': return 250;
        case 'lg': return 300;
        case 'xl': return 300;
      }
    },
    height: function() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return 100;
        case 'sm': return 100;
        case 'md': return 150;
        case 'lg': return 200;
        case 'xl': return 250;
      }
    }
  },
  async mounted() {
    // firebase authenticationから現在ログインしているユーザの状態を取る
    let user = await authStateChanged();
    if (user.uid) { //useのuidで判定していたが，それだとnullの時にエラーが生じる
      try {
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        this.attribute = querySnapshot.data().attribute;
        this.balance = querySnapshot.data().balance;
        this.roomPath = querySnapshot.data().group;
        try {
          this.myroomName = querySnapshot.data().myroomName;
        }
        catch(error) {
          console.log(error);
        }
        if (!this.roomPath) {
          this.$store.commit("addMessage", {
            text: "不正入室です.グループ参加後に入室してください",
            risk: 3,
          })
          this.$router.push('/')
        }
        const groupRef = doc(fireStore, "groups", this.roomPath);
        const groupItems = await getDoc(groupRef);
        this.roomName = groupItems.data().name;
        // if (this.myroomName!==null) {
        //   this.roomName = this.myroomName;
        // }
        this.userName = user.displayName;
      }
      catch(error) {
        console.log(error);
        console.log('ログインしてください')
        this.$store.commit("addMessage", {
          text: "ユーザが確認できませんでした．ログインしてください",
          risk: 3,
        })
        this.$router.push('/');
      }
    }
    else {
      console.log('ログインしてください')
      this.$store.commit("addMessage", {
        text: "ユーザが確認できませんでした．ログインしてください",
        risk: 3,
      })
      this.$router.push('/');
    }
  },
  methods: {
    async logout() {
      this.$router.push("/");
      this.$store.commit("setIsLogin", false);
      await userLogout();
    }
  }
}
</script>
<style scoped>
.v-card {
  transition: opacity .7s ease-in-out;
}

.v-card.on-hover {
  color: red;
}

.balance {
  background-color: aquamarine;
  width: 100%
}
</style>