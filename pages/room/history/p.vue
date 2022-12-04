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
      >
				<div class="header">
					<v-alert 
						class="
							text-center
							text-h6
							my-0
							bg-grad
							lime--text
							text--lighten-3
							"
						border="bottom"
						colored-border
						color="blue accent-5"
						elevation="2"
					> 履歴 
					</v-alert>
				</div>
				<div class="main mb-10">
        <v-data-table
          :headers="headers"
          :items="history"
          item-key="id"
					:sort-by.sync="sortBy"
					:sort-desc.sync="sortDesc"
          class="
						elevation-0
					"
          fixed-header
          :height="$vuetify.breakpoint.height-170"
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
} from "firebase/firestore";
import {
  fireStore,
} from "~/plugins/firebase";
import {authStateChanged} from '@/plugins/auth'
import { fromStringWithSourceMap } from "source-list-map";

export default {
  data: () => ({
    selected: [],
		sortBy: "processed_date",
		sortDesc: true,
    headers: [
      {
        align: 'start',
        value: 'processed_date',
				sortable: false,
      },
      {
        value: 'data',
				sortable: false,
      },
    ],
    history: [],
    roomPath: null,
    historyCollRef: null,
  }),
  async mounted() {
    let user = await authStateChanged();
    if (user.uid) {
      try {
        //ログインユーザの情報から所属するグループのpresentsの参照を取得
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        const roomPath = querySnapshot.data().group;
        this.roomPath = roomPath;
        const historyCollRef = collection(fireStore, "groups", roomPath, "history")
        this.hitoryCollRef = historyCollRef;

        //参照の中からhistoryを取得
        const history_all = await getDocs(historyCollRef);
        history_all.forEach(doc => {
          let data = doc.data();
          data.id = doc.id;
          data.processed_date = (doc.data().date).toDate().toLocaleString('ja-JP');
          this.history.push(data);
        })
      }
      catch(error) {
        console.log('historyが取得できませんでした');
        console.log(error);
      }
    }
  },
  methods: {
    goToHome() {
      this.$router.push('/room');
    }
  }
}
</script>
<style scss>
.header {
	z-index: 5;
	width: 100%;
	height: 50px;
	position: fixed;
	vertical-align: top;
}

.main {
	position: relative;
	top: 50px;
}

.bg-grad {
	background: linear-gradient(-45deg,  #9cecfb, #65c7f7, #0052d4, #290BA1);
}

.bg-yellow {
	background-color: #FCFCD7;
}

/* これよくわからんけど，背景色変えれるみたい．どんな理屈で動いてるんや？ */
.theme--light.v-data-table
> .v-data-table__wrapper
> table
> tbody
> tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper)
{
	color: red;
}
</style>