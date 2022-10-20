<template>
  <div v-if="isLogin">
    <div v-if="attribute=='parent'">親用ページ</div>
    <div v-if="attribute=='child'">こども用ページ</div>
    <!-- <div>{{user.Attribute}}</div>
    <div>{{user.balance}}</div> -->
  </div>
</template>
<script>
import {getAuth} from 'firebase/auth'
import {authStateChanged} from '@/plugins/auth'
import { 
  querySnapshot,
  fireStore,
  func,
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
    if (user.uid) {
      this.isLogin = true;
      try {
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        this.attribute = querySnapshot.data().attribute;
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
    // console.log(user.uid);
    // //func();
    // try {
    //   // const q = collection(fireStore, "users");
    //   
    //   
    //   console.log(querySnapshot.data());
    //   
    //   // querySnapshot.forEach(doc => {
    //   //   console.log(doc.data());
    //   // })
    // }
    // catch(error) {
    //   console.log(error)
    // }
  },
  methods: {
    
  }
}
</script>
<style scoped>

</style>