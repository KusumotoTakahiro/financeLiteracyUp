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
						elevation="2">現在の税金一覧
          </v-alert>
        </div>
        <div class="main mb-10 mt-10">
					<v-data-table
							:headers="headers"
							:items="taxs"
							:single-select="false"
							item-key="id"
							class="elevation-0"
							fixed-header
							:height="$vuetify.breakpoint.height-210"
						></v-data-table>
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
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
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
			headers: [
				{
					text: '税金項目',
					align: 'start',
					sortable: false,
					value: 'content',
				},
				{
          text: '課税対象',
          value: 'target'
        },
				{
					text: '税率（%）',
					value: 'price'
				}
			],
			taxs: [],
			selected: [],
			user: null,
			roomPath: null,
			taxCollRef: null,
		}
	},
	computed: {
		width: function() {
			return this.$vuetify.breakpoint.width/5*4;
		}
	},
	async mounted() {
    let user = await authStateChanged();
    console.log(user);
    if (user.uid) {
      this.user = user;
      try {
        //ログインユーザの情報から所属するグループのtaxsの参照を取得
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        const roomPath = querySnapshot.data().group;
        this.roomPath = roomPath;
        const taxCollRef = collection(fireStore, "groups", roomPath, "taxs")
        this.taxCollRef = taxCollRef;
        
        //参照の中からtaxsを取得して，taxs(collection)の中のdocumentを全取得
        const taxs_all = await getDocs(taxCollRef);
        console.log(taxs_all)
        taxs_all.forEach(doc => {
          //ここでtaxsを更新する =>データがテーブルに反映されるはず
          let data = doc.data();
          data.id = doc.id;
          this.taxs.push(data);
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
	methods: {
		goToHome() {
			this.$router.push('/room');
		},
	}
})
</script>
<style scoped>

</style>