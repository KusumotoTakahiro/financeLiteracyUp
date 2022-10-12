<template>
  <div>
    <div>ユーザページ</div>
    <div>{{userData}}</div>
    <div>{{userData}}</div>
    <div>{{userData}}</div>
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
    console.log(user.uid);
    //func();
    try {
      const q = collection(fireStore, "users");
      const docRef = doc(fireStore, "users", user.uid);
      const querySnapshot = await getDoc(docRef);
      console.log(querySnapshot.data());
      this.userData = querySnapshot.data().history;
      // querySnapshot.forEach(doc => {
      //   console.log(doc.data());
      // })
    }
    catch(error) {
      console.log(error)
    }


    
    
  },
  methods: {
    
  }
}
</script>
<style scoped>

</style>