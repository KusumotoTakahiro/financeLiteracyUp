<template>
	<v-row align-content="center" justify="center" class="bg-yellow">
		<v-col cols="12" xs="12" sm="12" md="12" lg="12">
			<v-card
        class="
					d-flex
          justify-center
					mx-auto
        "
        elevation="10"
        :width="$vuetify.breakpoint.width-50"
        :height="$vuetify.breakpoint.height"
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
						elevation="2"> 貸す・借りる
          </v-alert>
        </div>
        <div class="main mb-10 mt-10" >
          <v-row
            class="mt-3 mb-3 mx-auto"
            align-content="center"
            justify="space-around"
          >
            <v-btn class="mx-auto mb-1" width="7rem" @click="goToHome()">
              Homeに戻る
            </v-btn>
          </v-row>
        </div>
			</v-card>
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
	serverTimestamp,
} from "firebase/firestore";
import {
  fireStore,
} from "~/plugins/firebase";
import {
	authStateChanged,
	saveHistory,
} from '@/plugins/auth'



export default ({
	data() {
		return {
			user: null,
			roomPath: null,
		}
	},
	async mounted() {
		let user = await authStateChanged();
		this.user = user;
		if (user.uid) {
			this.isLogin = true;
			try {
				//ログインユーザの情報から所属グループを参照し，worksを取得
				const docRef = doc(fireStore, "users", user.uid);
				const querySnapshot = await getDoc(docRef);
				const roomPath = querySnapshot.data().group;
				this.roomPath = roomPath;
			}
			catch(error) {
				console.log(error)
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

	},
	methods: {
		goToHome() {
			this.$router.push('/room');
		},
  }
})
</script>
<style scoped>

</style>