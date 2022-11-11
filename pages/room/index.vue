<template>
  <v-row align-content="center" justify="center">
    <v-col cols="12" sm="12" md="12" lg="12" xl="12" align="center">
        <div v-if="attribute=='parent'">
          <v-card
            class="
              d-flex 
              align-content-space-around 
              flex-wrap 
              justify-center 
              mt-15
              "
            flat
            tile
            :height="$vuetify.breakpoint.height-200"
          >
          <template v-for="item in parentItems">
          <v-hover v-slot="{ hover }" open-delay="50">
            <v-card
              :key="item"
              :to="item.to"
              color=""
              outlined
              :height="$vuetify.breakpoint.height/6"
              width="200"
              class="mx-6 mb-3"
              :class="{ 'on-hover': hover }"
              :elevation="hover ? 12 : 4"
              style="background-color: white;"
            >
            <v-card-text class="my-auto" >
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
        <div v-if="attribute=='child'">
          <v-card
            v-for="item in childItems"
            :key="item"
            :to="item.to"
            color=""
          >{{item.title}}</v-card>
        </div>
      <div>user.attribute : {{attribute}}</div>
      <div>room.name : {{roomName}}</div>
    </v-col>
  </v-row>
</template>
<script>
import {getAuth} from 'firebase/auth'
import * as func from "~/plugins/myPlugins";
import {authStateChanged} from '@/plugins/auth'
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
      roomPath: null,
      roomName: null,
      parentItems: [
        {
          icon: "mdi-hexagon-slice-3",
          title: "お手伝い追加",
          to: `room/work/p`,
          color: "light-blue lighten-1",
        },
        {
          icon: "mdi-basket",
          title: "ショップ追加",
          to: `room/shop/p`,
          color: "amber darken-1",
        },
        {
          icon: "mdi-emoticon-angry-outline",
          title: "罰金追加",
          to: `room/fine/p`,
          color: "red lighten-1",
        },
        {
          icon: "mdi-emoticon-outline",
          title: "ご褒美追加",
          to: `room/present/p`,
          color: "deep-orange lighten-3",
        },
        {
          icon: "mdi-clipboard-text-clock",
          title: "履歴",
          to: `room/history/p`,
          color: "teal lighten-2",
        },
        {
          icon: "mdi-cash-100",
          title: "タックス追加",
          to: `room/tax/p`,
          color: "brown lighten-3",
        },
        {
          icon: "mdi-account-multiple-plus",
          title: "ルーム招待",
          to: `room/invite`,
          color: "blue-grey darken-1",
        }
      ],
      childItems: [
        {
          icon: "mdi-hexagon-slice-3",
          title: "お手伝い",
          to: `/room/work/c` 
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "ショップ",
          to: `room/shop/c`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "罰金",
          to: `room/fine/c`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "ご褒美",
          to: `room/present/c`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "履歴",
          to: `/room/history/c` 
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "タックス",
          to: `room/tax/c`,
        },
      ]
    }
  },
  computed: {
    user: function() { 
      return this.$store.getters.getUser; 
    }
  },
  async mounted() {
    // firebase authenticationから現在ログインしているユーザの状態を取る
    let user = await authStateChanged();
    console.log(user);
    if (user.uid) {
      this.isLogin = true;
      try {
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        this.attribute = querySnapshot.data().attribute;
        this.roomPath = querySnapshot.data().group;
        console.log(this.roomPath);
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
        console.log(this.roomName);
        this.userName = user.displayName;
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
}
</script>
<style scoped>
.v-card {
  transition: opacity .7s ease-in-out;
}

.v-card.on-hover {
  color: red;
}
</style>