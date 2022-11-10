<template>
	<v-row>
		<v-col cols="12" sm="12" md="12" lg="12" xl="12">
			<v-alert class="justify-center text-center text-h5"> グループに招待 </v-alert>
				<v-card 
					class="py-5 mx-auto"
					elevation="0"
					width="450"
				>
					<v-text-field
						label="検索"
						placeholder="佐賀太郎"
						v-model="forWhom"
						hint="招待するユーザのユーザ名を入力してください"
						outlined
						:height="height/15"
						width="600"
						@keyup.enter="search_user"
					></v-text-field>
					<v-row>
						<v-btn
							class="mx-auto mt-15"
							height="40"
							width="150"
							color=""
							@click="search_user()"
						>検索</v-btn>
						<v-btn
							class="mx-auto mt-15"
							height="40"
							width="150"
							color=""
							@click="goToHome()"
						>Homeに戻る</v-btn>
					</v-row>
					<v-dialog
						v-model="dialog"
						:height="$vuetify.breakpoint.height/2"
						max-width="600"
						hide-overlay
						content-class="rounded-lg elevation-0"
						transition="dialog-bottom-transition"
					>
						<v-divider></v-divider>
						<v-data-table
							v-model="selected"
							:headers="headers"
							:items="users"
							:single-select="false"
							item-key="content"
							show-select
							class="elevation-1"
							fixed-header
							scrollable="false"
							:height="$vuetify.breakpoint.height/3"
						></v-data-table>
						<v-spacer></v-spacer>
						<v-card-actions>
						<v-btn
							class="black--text mt-5 mb-3 mx-auto"
							height="40"
							color=""
							large
							@click="invite_user()"
						>招待</v-btn>
						</v-card-actions>
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
						let one_user = [];
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
			for(let key in obj ) {
        if( obj.hasOwnProperty(key) ) {
					console.log(obj[key].uid)
          try {
            const comRef = collection(fireStore, "users", obj[key].uid, "comminicate");
						const invite = await addDoc(comRef, {
							forWhat: "invite",
							forWhom: obj[key].name,
							fromWhom: this.user.displayName,
							fromWhomUid: this.user.uid,
							roomPath: this.roomPath,
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