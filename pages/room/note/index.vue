<template>
	<v-row align-content="center" justify="center">
		<v-col cols="12" xs="12" sm="12" md="12" lg="12">
			<v-dialog
				v-model="dialog1"
				outlined
				hide-overlay
				:height="$vuetify.breakpoint.height"
				:max-width="width"
				content-class="rounded-lg elevation-3"
        transition="dialog-bottom-transition"
				persistent
			>
				<v-alert 
					class="
						justify-center 
						text-center 
						text-h6
						pb-0
					"> 通知 </v-alert>
				<v-data-table
					:headers="headers"
					:items="notes"
					item-key="uid"
					class="elevation-1"
					fixed-header
					:height="$vuetify.breakpoint.height/5*3"
				>
				<template #[`item.approve`]="{ item }">
					<v-radio-group
						v-model="item.approve"
						row 
					>
						<v-radio
							label="認める"
							value="approve"
						></v-radio>
						<v-radio
							label="認めない"
							value="disapprove"
						></v-radio>
					</v-radio-group>
				</template>
				</v-data-table>
				<v-row 
					class="mt-3 mb-3 mx-auto"
					align-content="center" 
					justify="space-around" 
					style="height:40px">
					<v-btn
						class="black--text"
						height="40"
						@click="reportProgress()"
					>　返 信　</v-btn>
                    <v-btn
						class="black--text"
						height="40"
						@click="goToHome()"
					>Homeに戻る</v-btn>
				</v-row>
			</v-dialog>
			<v-dialog
				v-model="cdialog1"
				outlined
				hide-overlay
				:max-width="width/5*3"
				content-class="rounded-lg elevation-3"
        transition="dialog-bottom-transition"
				persistent
				
			>
			<div style=" background-color: white;">
				<v-alert
				class="justify-center text-center text-body-2"
				>		
						{{this.disconfirm}}<br/>
						{{this.confirm_text}}
					<br/>よろしいですか？
				</v-alert>
				<v-row 
					class="mt-3 mb-0 pb-5 mx-auto"
					align-content="center" 
					justify="space-around" 
					style="height:40px;">
					<v-btn
						class="black--text"
						height="40"
						@click="sendProgress()"
					>はい</v-btn>
					<v-btn
						class="black--text px-2"
						height="40"
						@click="cdialog1=false"
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
import {authStateChanged} from '@/plugins/auth'
import { default_type } from "mime";
import { memberExpression } from "@babel/types";



export default ({
	data() {
		return {
			dialog1: true,
			cdialog1: false,
			headers: [
				{
					text: '承認',
					align: 'start',
					sortable: false,
					value: 'approve',
				},
				{
					text: '誰から',
					value: 'who',
				},
				{
					text: '種別',
					value: 'type'
				},
				{
					text: '内容',
					value: 'content'
				},
				{
					text: 'いつ',
					value: 'when'
				},
			],
			notes: [], 
			member: [],
			confirm_text: "全項目を承認して送ります",
			disconfirm: "",
			user: null,
			roomPath: null,
			comCollRef: null,
		}
	},
	async mounted() {
		let user = await authStateChanged();
		this.user = user;
		if (user.uid) {
			this.isLogin = true;
			try {
				//ログインユーザの情報から所属グループを参照し，communicationを取得
				const docRef = doc(fireStore, "users", user.uid);
				const querySnapshot = await getDoc(docRef);
				const roomPath = querySnapshot.data().group;
				this.roomPath = roomPath;
				const comCollRef = collection(fireStore, "groups", roomPath, "communication");
				this.comCollRef = comCollRef;
                
				//worksを全取得し，テーブルに格納する
				const com_all = await getDocs(comCollRef);
				com_all.forEach(doc => {
					if (doc.data().confirmed === false) { //未読の場合
						let data = doc.data();
						let pdata = {};
						pdata.uid = doc.id;
						switch (data.type) {
							case 'work':
								pdata.content = "『" + data.content + "』" + "を行いました";
								break;
							case 'present':
								pdata.content = "『" + data.content + "』" + "を達成しました";
								break;
							case 'fine':
								pdata.content = "『" + data.content + "』" + "を行いました";
								break;
							case 'shop':
								pdata.content = "『" + data.content + "』" + "を購入しました";
								break;
							case 'apply':
								pdata.content = "グループへの参加を申請します!"
								break;
							default:
								pdata.content = "『" + data.content + "』" + "についての連絡です"
								break;
						}
						pdata.who = data.reporterName;
						pdata.when = data.adate.toDate().toLocaleDateString();
						pdata.type = data.type;
						pdata.data = data;
						pdata.approve = "approve";
						this.notes.push(pdata);
					}
				})
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
	computed: {
		width: function() {
			return this.$vuetify.breakpoint.width/5*4;
		},
	},
	methods: {
		goToHome() {
			this.$router.push('/room');
		},
		reportProgress() {
			this.cdialog1 = true;
			let contents = [];
			let member = [];
			this.notes.forEach(note => {
				if (note.approve==="disapprove") {
					contents.push(note.data.content);
					member.push(note.data.reporter);
				}
			})
			this.member = [...(new Set(member))]; //重複削除
			if (contents.length > 0) {
				this.disconfirm = "";
				this.confirm_text = "を承認していません。";
				for(let i = 0; i < contents.length; i++) {
					this.disconfirm += contents[i] + ", ";
				}
			}
			else {
				this.disconfirm = "";
				this.confirm_text = "全項目を承認して送ります。"
			}
		},
		async sendProgress() {
			//承認内容を送る(communicationを上書きする)
			
			

			await fetch_data();
			this.cdialog1 = false;
		},
		async caluculate_child_balance(data) {

		},
		async fetch_data() {
			//sendProgressの後に実行される
			/*
			通知が確認済みとなり，テーブルから消えたことを確認する．
			同時に，新しい通知をDBからfetchする際に使うメソッド
			*/
			const com_all = await getDocs(this.comColRef);
			this.notes = [];
			com_all.forEach(doc => {
				if (doc.data().confirmed === false) { //未読の場合
					let data = doc.data();
					let pdata = {};
					pdata.uid = doc.id;
					switch (data.type) {
						case 'work':
							pdata.content = "『" + data.content + "』" + "を行いました";
							break;
						case 'present':
							pdata.content = "『" + data.content + "』" + "を達成しました";
							break;
						case 'fine':
							pdata.content = "『" + data.content + "』" + "を行いました";
							break;
						case 'shop':
							pdata.content = "『" + data.content + "』" + "を購入しました";
							break;
						case 'apply':
							pdata.content = "グループへの参加を申請します!"
							break;
						default:
							pdata.content = "『" + data.content + "』" + "についての連絡です"
							break;
					}
					pdata.who = data.reporterName;
					pdata.when = data.adate.toDate().toLocaleDateString();
					pdata.type = data.type;
					pdata.data = data;
					pdata.approve = "approve";
					this.notes.push(pdata);
				}
			})
		}
	}
})
</script>
<style scoped>

</style>