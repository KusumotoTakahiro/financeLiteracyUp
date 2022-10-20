<template>
  <div v-if="isLogin">
    <div>
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
        <v-card
          v-for="item in userItems"
          :key="item"
          :to="item.to"
          color=""
        >{{item.title}}</v-card>
      </div>
      <div>user.attribute : {{attribute}}</div>
      <div>room.name : {{roomName}}</div>
    </div>
    
  </div>
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
      userItems: [
        {
          icon: "mdi-hexagon-slice-3",
          title: this.attribute==="child"? "ワーク":"ワーク追加",
          to: this.attribute==="child"? 
            `/room/${this.roomPath}/work/c.vue` 
            : `room/${this.roomPath}/work/p.vue`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: this.attribute==="child"? "ショップ":"ショップ追加",
          to: this.attribute==="child"? 
            `/room/${this.roomPath}/shop/c.vue` 
            : `room/${this.roomPath}/shop/p.vue`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: this.attribute==="child"? "ばっきん":"ばっきん追加",
          to: this.attribute==="child"? 
            `/room/${this.roomPath}/fine/c.vue` 
            : `room/${this.roomPath}/fine/p.vue`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: this.attribute==="child"? "ごほうび":"ごほうび追加",
          to: this.attribute==="child"? 
            `/room/${this.roomPath}/present/c.vue` 
            : `room/${this.roomPath}/present/p.vue`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: this.attribute==="child"? "ヒストリー":"ヒストリー追加",
          to: this.attribute==="child"? 
            `/room/${this.roomPath}/history/c.vue` 
            : `room/${this.roomPath}/history/p.vue`,
        },
        {
          icon: "mdi-hexagon-slice-3",
          title: this.attribute==="child"? "タックス":"タックス追加",
          to: this.attribute==="child"? 
            `/room/${this.roomPath}/tax/c.vue` 
            : `room/${this.roomPath}/tax/p.vue`,
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
    
  }
}
</script>
<style scoped>

</style>