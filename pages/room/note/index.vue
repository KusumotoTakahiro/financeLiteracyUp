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
		reportProgress() { //確認フォームの表示兼データ成型
			console.log("report Progress")
			if (this.notes.length===0) {
				this.$store.commit("addMessage", {
					text: "現在，通知は届いていません",
					risk: 3, 
				})
				return;
			}
			this.cdialog1 = true;
			let contents = [];
			let member = [];
			this.notes.forEach(note => {
				if (note.approve==="disapprove") {
					contents.push(note.data.content);
				}
				console.log(note.data.reporter);
				member.push(note.data.reporter); //報告者のUIDを識別子として保存
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
		async caluculate_all() {
			console.log('caluculate_all');
			let obj = {}; //各メンバーの金額を扱うオブジェクト
			this.member.forEach(one => {
				obj[one] = 0; //各メンバーの金額を初期化
			})
			for (let i = 0; i < this.notes.length; i++) {
				let note = this.notes[i];
				let who = note.data.reporter;
				await this.caluculate_price(note.approve, note.type, note.data.did)
				.then((val) => {
					obj[who] += Number(val);
					console.log(obj[who]);
				})
			}
			return obj;
		},
		//各メンバーのpriceをそれぞれupdate ※forEachでは，awaitが使えないらしい
		async update_member(obj) {
			console.log('update_member');
			console.log(obj);
			for (let key in obj) {
				if (obj.hasOwnProperty(key)) {
					let price = obj[key];
					console.log('price : ', price);
					const ref = doc(fireStore, "users", key);
					const querySnapshot = await getDoc(ref);
					const balance = querySnapshot.data().balance;
					await updateDoc(ref, {
						balance: balance + price,
					})
				}
				else {
					console.log('update_member error');
				}
			}
		},
		async sendProgress() { //承認内容を送る(communicationを上書きする)
			console.log('send Progress');
			//各メンバーごとに金額を計算  
			//thenで()=>{}（アロー関数）の形を取っていなかったからエラーになっていた?
			await this.caluculate_all()
			.then((obj) => this.update_member(obj))
			.then(() => func.myPromiseAll(this.notes, this.updateNote))
			.then(() => func.myPromiseAll(this.notes, this.historySave))
			.then(() => this.fetch_data())
			.then(()=> {
				console.log('dialog false');
				this.cdialog1 = false;
				this.$store.commit("addMessage", {
					text: "全項目に対して返信しました",
					risk: 1, 
				})
			})
		},
		updateNote(note){
			new Promise(resolve => {
				console.log('updateNote');
				const comref = doc(fireStore, "groups", this.roomPath, "communication", note.uid);
				updateDoc(comref, {
					confiremer: this.user.uid,
					confiremerName: this.user.displayName,
					confirmed: true, //確認済み
					accept: note.approve==="approve" ? true : false,
					cdate: serverTimestamp(),
				})
				resolve();
			})
		},
		historySave(note) {
			new Promise(resolve => {
				console.log('historySave');
				const hiscoll = collection(fireStore, "groups", this.roomPath, "history");
				let d = "";
				if (note.approve==="approve") {
					d = `user: ${this.user.displayName}の判断により『${note.content}』が承認されました`;
				}
				else {
					d = `user: ${this.user.displayName}の判断により『${note.content}』を承認されませんでした`;
				}
				addDoc(hiscoll, {
					rid: this.user.uid,
					cid: null,
					date: serverTimestamp(),
					data: d,
				})
				resolve();
			})
		},
		async caluculate_price(approve, type, did) {
			let ref = null; //db参照先
			let data = null; //db内のdocument
			let original_price = 0; //documentの中のprice
			if (approve==="disapprove") return 0; //承認されていないので0で返却
			switch (type) {
				case "work":
					ref = doc(fireStore, "groups", this.roomPath, "works", did);
					break;
				case "present":
					ref = doc(fireStore, "groups", this.roomPath, "presents", did);
					break;
				case "shop":
					ref = doc(fireStore, "groups", this.roomPath, "shops", did);
					break;
				case "fine":
					ref = doc(fireStore, "groups", this.roomPath, "fines", did);
					break;
				case "apply": //子供からの参加申請もここで受け付ける．今は未実装.
					break;
				default:
					console.log("something is wrong");
					break;
			}
			data = await getDoc(ref);
			original_price = data.data().price;
			switch (type) { //ここで元の値段に税金がかかる．今は未実装.
				case "work":
					original_price = original_price;
					break;
				case "present":
					original_price = original_price;
					break;
				case "shop":
					original_price = - original_price;
					break;
				case "fine":
					original_price = - original_price;
					break;
				default:
					console.log("something is wrong");
					original_price = 0;
					break;
			}
			return original_price;
		},
		async fetch_data() {
			//sendProgressの後に実行される
			/*
			通知が確認済みとなり，テーブルから消えたことを確認する．
			同時に，新しい通知をDBからfetchする際に使うメソッド
			*/
			console.log('fetch_data');
			const com_all = await getDocs(this.comCollRef);
			this.notes = [];
			com_all.forEach(doc => {
				try {
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