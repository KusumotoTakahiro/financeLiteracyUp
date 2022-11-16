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
						elevation="2"> 現在のご褒美一覧 
          </v-alert>
        </div>
				<div class="main mb-10 mt-10">
					<v-data-table
						v-model="selected"
						:headers="headers"
						:items="my_works"
						:single-select="false"
						item-key="id"
						show-select
						class="elevation-0"
						fixed-header
						:height="$vuetify.breakpoint.height/2-110"
					></v-data-table>
					<v-divider></v-divider>
					<v-data-table
						:headers="headers"
						:items="others_works"
						:single-select="false"
						item-key="id"
						class="elevation-0 blue-grey lighten-4 "
						fixed-header
						:height="$vuetify.breakpoint.height/2-110"
						hide-default-header
						hide-default-footer
					></v-data-table>
          <v-row
            class="mt-3 mb-3 mx-auto"
            align-content="center"
            justify="space-around"
          >
            <v-btn class="mx-auto mb-1" width="7rem" @click="report()">
              達成報告
            </v-btn>
            <v-btn class="mx-auto mb-1" width="7rem" @click="goToHome()">
              Homeに戻る
            </v-btn>
          </v-row>
        </div>
      </v-card>
			<v-dialog
				v-model="cdialog"
				outlined
				hide-overlay
				:max-width="width/5*3"
				content-class="rounded-lg elevation-3"
        transition="dialog-bottom-transition"
				persistent
			>
      <div style="background-color: white;">
        <v-alert
          class="justify-center text-center text-body-2"
        >
          上記内容を達成したと報告します．
          <br/>よろしいですか？
        </v-alert>
        <v-row 
          class="mt-3 mb-0 mx-auto pb-5"
          align-content="center" 
          justify="space-around" 
          style="height:40px">
          <v-btn
            class="black--text"
            height="40"
            @click="reportProgress()"
          >はい</v-btn>
          <v-btn
            class="black--text px-2"
            height="40"
            @click="cdialog=false"
          >いいえ</v-btn>
        </v-row>
      </div>
			</v-dialog>
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
	saveHistory
} from '@/plugins/auth'



export default ({
	data() {
		return {
			dialog1: true,
			cdialog: false,
			plane: false,
			headers: [
				{
					text: 'ご褒美',
					align: 'start',
					sortable: false,
					value: 'content',
				},
				{
					text: '対象者',
					value: 'forWhom.name',
				},
				{
					text: '報酬（パパ円）',
					value: 'price'
				}
			],
			my_works: [],
			others_works: [],
			selected: [],
			user: null,
			roomPath: null,
			workCollRef: null,
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
				const workCollRef = collection(fireStore, "groups", roomPath, "presents")
				this.workCollRef = workCollRef;

				//worksを全取得し，テーブルに格納する
				const works_all = await getDocs(workCollRef);
				works_all.forEach(doc => {
					let data = doc.data();
          data.id = doc.id;
					if (data.forWhom.uid === user.uid) {
						this.my_works.push(data);
					}
					else {
						this.others_works.push(data);
					}
				})
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
		width: function() {
			return this.$vuetify.breakpoint.width/5*4;
		}
	},
	methods: {
		goToHome() {
			this.$router.push('/room');
		},
		report() {
			let s = this.selected.length;
			if (s>0) {
				this.cdialog = true;
			}
			else {
				this.$store.commit("addMessage", {
					text: "報告内容が選択されていません",
					risk: 3, 
				})
			}
		},
		async reportProgress() {
			console.log('report progress')
			let obj = this.selected;
			let flag = true;
			for (let key in obj) {
				try {
					//communicateに申請データを追加
					const comcoll = collection(fireStore, "groups", this.roomPath, "communication");
					const docRef = await addDoc(comcoll, {
						type: "present",
						did: obj[key].id, //documentID
						content: obj[key].content,
						confirmed: false, //確認済みか
						accept: false,   //受理されたか
						reporter: this.user.uid, 
						reporterName: this.user.displayName,
						confiremer: null,
						confiremerName: null,
						adate: serverTimestamp(),
						cdate: null
					})
				}
				catch(error) {
					console.log('commnunicateへの通信でエラー発生')
					console.log(error);
					flag = false;
				}
				try {
					await saveHistory(this.roomPath, this.user.uid, 
						`${this.user.displayName}が${obj[key].content}を達成したと報告しました`
					)
				}
				catch(error) {
					console.log('historyへの通信エラー発生');
					console.log(error);
					flag = false;
				}
			}
			if (flag) {
				this.$store.commit("addMessage", {
					text: "達成報告を行いました！！",
					risk: 1, 
				})
			}
			this.cdialog = false;
		},
		async fetch_data() {
			const works_all = await getDocs(this.workColRef);
			this.works = [];
			works_all.forEach(doc => {
				try {
					let data = doc.data();
					data.id = doc.id;
					if (data.forWhom.uid === this.user.uid) {
						this.my_works.push(data);
					}
					else {
						this.others_works.push(data);
					}
				}
				catch(error) {
					console.log(error);
				}
			})
		}
	}
})
</script>
<style scoped>

</style>