<template>
 
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

export default {
  name: 'joinGroupPage',
  layout: "default",

  data() {
    return {
        dialog: true,
    }
  },
  
}
</script>
<style>

</style>