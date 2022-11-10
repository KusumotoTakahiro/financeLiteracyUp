<template>
  <v-row>
    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
      <div>確認表示</div>
      <div v-if="attribute=='parent'">親用ページ</div>
      <div v-if="attribute=='child'">こども用ページ</div>
      <div 
        class=
          "
          d-flex 
          flex-column 
          justify-center
          "
        >
        <div v-if="attribute=='parent'">
          <v-card
            v-for="item in parentItems"
            :key="item"
            :to="item.to"
            color=""
          >{{item.title}}</v-card>
        </div>
        <div v-if="attribute=='child'">
          <v-card
            v-for="item in childItems"
            :key="item"
            :to="item.to"
            color=""
          >{{item.title}}</v-card>
        </div>
      </div>
      <v-btn @click="test()">test go button</v-btn>
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
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "ショップ追加",
          to: `room/shop/p`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "罰金追加",
          to: `room/fine/p`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "ご褒美追加",
          to: `room/present/p`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "履歴",
          to: `room/history/p`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "タックス追加",
          to: `room/tax/p`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: "ルーム招待",
          to: `room/invite`,
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
  methods: {
    test() {
      console.log(this.roomPath)
    }
  }
}
</script>
<style scoped>

</style>