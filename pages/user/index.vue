<template>
  <div>
    <div>ユーザページ</div>
    <!-- <div>{{user.Attribute}}</div>
    <div>{{user.balance}}</div> -->
  </div>
</template>
<script>
import {getAuth} from 'firebase/auth'
import {authStateChanged} from '@/plugins/auth'
import querySnapshot from '@/plugins/firebase'
import { 
  collection, 
  getDocs, 
  doc, 
  Firestore 
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
    console.log(user);
    console.log(querySnapshot);
    
    
  },
  methods: {
    
  }
}
</script>
<style scoped>

</style>