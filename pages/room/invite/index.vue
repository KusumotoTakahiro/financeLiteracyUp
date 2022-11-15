<template>
	<v-row align-content="center" justify="center" class="bg-yellow">
		<v-col cols="12" sm="12" md="12" lg="12" xl="12">
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
						elevation="2"> グループに招待
					</v-alert>
				</div>
				<v-card 
					class="mb-0 mt-15 mx-1"
					height="200px"
					style="position: fixed; top:70px"
					elevation="0"
				>
					<v-text-field
						label="検索"
						placeholder="ユーザ名を入力"
						v-model="forWhom"
						class="mt-7 mb-0"
						outlined
						:height="height/15"
						width="600px"
						@keyup.enter="search_user"
						append-icon="mdi-magnify"
						@click:append="search_user"
					></v-text-field>
					<v-row
						class="mt-0 mb-3 mx-auto"
						align-content="center"
						justify="space-around"
					>
						<v-btn
							class="mx-auto"
							@click="search_user()"
						>　検 索　</v-btn>
						<v-btn
							class="mx-auto"
							@click="goToHome()"
						>Homeに戻る</v-btn>
					</v-row>
				</v-card>
				<v-dialog
					v-model="dialog"
					:height="$vuetify.breakpoint.height/2"
					max-width="600"
					hide-overlay
					content-class="rounded-lg elevation-2"
					transition="dialog-bottom-transition"
				>
					<v-data-table
						v-model="selected"
						:headers="headers"
						:items="users"
						:single-select="false"
						item-key="uid"
						show-select
						class="elevation-0"
						fixed-header
						scrollable="false"
						hide-default-footer
						:height="$vuetify.breakpoint.height/3"
					></v-data-table>
					<v-divider></v-divider>
					<v-row 
						class="mt-3 mb-3 mx-auto"
            align-content="center"
            justify="space-around"
					>
						<v-btn
						class="black--text mt-5 mb-3 mx-auto"
						height="40"
						width="200"
						large
						@click="invite_user()"
						>招待</v-btn>
						<v-btn
							class="black--text mt-5 mb-3 mx-auto"
							height="40"
							width="200"
							large
							@click="dialog=false"
						>キャンセル</v-btn>
					</v-row>
				</v-dialog>
			</v-card>
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
	serverTimestamp,
	addDoc,
	setDoc,
} from 'firebase/firestore'


export default {
  data() {
		return {
			user: null,
			dialog: false,
			headers: [
				{
					text: '名前',
					align: 'start',
					sortable: false,
					value: 'name',
				},
				{
					text: 'タイプ',
					value: 'attribute',
				}
			],
			users: [],
			selected: [],
			attribute: "",
			userName: "",
			roomPath: null,
			roomName: null,
			forWhom: null,
		}
		},
		computed: {
		height: function() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs': return 220
				case 'sm': return 400
				case 'md': return 500
				case 'lg': return 600
				case 'xl': return 800
			}
		},
  },
  async mounted() {
	// firebase authenticationから現在ログインしているユーザの状態を取る
	let user = await authStateChanged();
	this.user = user;
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
		async search_user() {
			try {
				const userCollection = collection(fireStore, "users");
				const users_all = await getDocs(userCollection);
				this.users = [];
				users_all.forEach(doc => {
					//検索名と完全一致
					if (doc.data().name===this.forWhom) {
						let one_user = {};
						one_user.uid = doc.id;
						one_user.name = doc.data().name;
						one_user.attribute = doc.data().attribute;
						this.users.push(one_user);
					}
				})
				this.dialog = true;
			}
			catch(error) {
				console.log(error);
			}
		},
		async invite_user() {
			console.log('invite_user');
			let obj = this.selected;
			if (obj.length===0) {
				this.$store.commit("addMessage", {
					text: "招待する人が選択されていません。",
					risk: 3,
				})
			}
			for(let key in obj ) {
        if( obj.hasOwnProperty(key) ) {
					console.log(obj[key].uid)
          try {
						const uid = obj[key].uid;
            const comRef = doc(fireStore, "users", uid, "comminicate", uid);
						const invite = await setDoc(comRef, {
							forWhat: "invite",
							forWhom: obj[key].name,
							fromWhom: this.user.displayName,
							fromWhomUid: this.user.uid,
							roomPath: this.roomPath,
							roomName: this.roomName,
							time: serverTimestamp(),
						})
						alert(obj[key].name+'を招待しました');
          }
          catch(error) {
            console.log(error)
          }
        }
      }
		},
		goToHome() {
      this.$router.push('/room')
    },
  }
}
</script>
<style scoped>
.v-text-field >>> input {
  font-size: 1.3em;
  padding: 0 !important;
	font-family: 'serif'
}
</style>