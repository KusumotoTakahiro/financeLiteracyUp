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
        <page-header title="自由記述一覧" />
        <div class="main mb-10 mt-10">
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="freeTrades"
            :single-select="false"
            item-key="id"
            class="elevation-0"
            fixed-header
            :height="$vuetify.breakpoint.height-210"
            @click:row="rowClick"
          ></v-data-table>
          <v-row
            class="mt-3 mb-3 mx-auto"
            align-content="center"
            justify="space-around"
          >
            <v-btn class="mx-1 mb-1" width="7rem" @click="dialog=true">
              追加
            </v-btn>
            <!-- <v-btn class="mx-auto mb-1" width="7rem" @click="delete_items()">
              削除
            </v-btn> -->
            <v-btn class="mx-1 mb-1" width="7rem" @click="goToHome()">
              Home
            </v-btn>
          </v-row>
        </div>
      </v-card>
      <!-- 個別追加 -->
      <add-free-trade 
        :dialog='dialog'
        subject='freeTrades'
        :subjectCollRef='freeTradeCollRef'
        :members='members'
        :attribute='attribute'
        @compAddOne='compAddOne'
      ></add-free-trade>
      <v-dialog
        v-model="detailDialog"
        outlined
        hide-overlay
        persistent
        max-width="600"
        content-class="rounded-lg elevation-2"
        transition="dialog-bottom-transition"
      >
        <v-card
          class="py-5"
          elevation="7"
          outlined
          shaped
        >
          <v-card-text>
            <div>
              <div class="form-header">宛先</div>
              <v-text-field
                v-model="selected_forWhom"
                variant="solo"
                readonly
              ></v-text-field>
            </div>
            <div>
              <div class="form-header">メッセージ</div>
              <v-textarea
                v-model="selected_content"
                variant="solo"
                readonly
              ></v-textarea>
            </div>
            <row>
              <div>
                <div class="form-header">タイプ</div>
                <v-text-field
                  v-model="selected_type"
                  variant="solo"
                  readonly
                ></v-text-field>
              </div>
              <div>
                <div class="form-header">金額</div>
                <v-text-field
                  v-model="selected_price"
                  variant="solo"
                  readonly
                ></v-text-field>
              </div>
            </row>
          </v-card-text>
          <div v-if="approved_player==='parent'">
            <v-row justify="space-around">
              <v-btn
                class="black--text mt-5"
                height="40"
                color=""
                @click="startCalc()"
              >許可する</v-btn>
              <v-btn
                class="black--text mt-5"
                height="40"
                color=""
                @click="rejectedTrade()"
              >却下する</v-btn>
            </v-row>
          </div>
          <div v-if="approved_player==='child'">
            <v-row justify="space-around">
              <v-btn
                class="black--text mt-5"
                height="40"
                color=""
                @click="startCalc()"
              >了解しました</v-btn>
            </v-row>
          </div>
          <v-card-actions class="justify-end">
            <v-btn
              text
              @click="detailDialog=false"
            >Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>
<script>
import {
  collection,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  fireStore,
} from "~/plugins/firebase";
import {
  authStateChanged,
} from '@/plugins/auth'
import '@/plugins/typeDefine'
import {
  delete_items,
  fetch_items,
  fetch_children,
  fetch_parents,
  caluculateBalance
} from '~/plugins/crudActions';

export default ({
  name: 'FreeTradeParentPage',
  layout: "default",

  head: {
    link: [
      {rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Material+Icons"}
    ]
  },

  data() {
    return {
      dialog: false,
      content: "",
      price: null,
      roomPath: null,
      freeTradeCollRef: null,
      user: null,
      members: [],
      selected: [],
      headers: [
        {
          text: '宛先',
          align: 'start',
          sortable: false,
          value: 'forWhom.name'
        },
        {
          text: 'メッセージ',
          sortable: false,
          value: `content.length`
        },
        {
          text: 'タイプ',
          sortable: false,
          value: 'tradeType'
        },
        {
          text: '金額（パパ円）',
          value: 'price'
        },
      ],
      freeTrades: [], // DBから取得した全データを格納.
      attribute: null,
      nowItem: null,
      detailDialog: false,
      selected_forWhom: '',
      selected_content: '',
      selected_price: '',
      selected_type: '',
      approved_player: 'none'
    }
  },
  async mounted() {
    let user = await authStateChanged();
    if (user.uid) {
      this.user = user;
      try {
        //ログインユーザの情報から所属するグループ情報を取得
        const docRef = doc(fireStore, "users", user.uid);
        const querySnapshot = await getDoc(docRef);
        this.attribute = querySnapshot.data().attribute;
        const roomPath = querySnapshot.data().group;
        this.roomPath = roomPath;
        const freeTradeCollRef = collection(fireStore, "groups", roomPath, "freeTrades")
        this.freeTradeCollRef = freeTradeCollRef;
        
        //参照の中からworksを取得して，works(collection)の中のdocumentを全取得
        this.freeTrades = await fetch_items(freeTradeCollRef);

        //自分のグループに参加しているchildユーザを全取得
        try {
          const memberCollRef = collection(fireStore, "groups", roomPath, "member");
          if (this.attribute === 'parent') {
            let children = await fetch_children(memberCollRef);
            this.members = children;
          } else {
            let parents = await fetch_parents(memberCollRef);
            this.members = parents;
          }
          
        }
        catch (error) {
          // memberが取得できなかったエラー
          this.message('『'+String(error) + '』が発生しました', 3);
        }
      }
      catch(e) {
        this.message('『'+String(e) + '』が発生しました', 3)
      }
    }
    else {
      this.message('ログインしてください', 3);
      this.$router.push('/');
    }
  },
  beforeDestroy() {},
  computed: {
		width: function() {
			return this.$vuetify.breakpoint.width/5*4;
		},
	},
  methods: {
    goToHome() {
      this.$router.push('/room')
    },
    compAddOne(data) {
      console.log(data);
      this.dialog = data.dialog;
      this.freeTrades = data.items;
    },
    async delete_items(){ //既にtableに登録されているアイテムのうち選択したものを削除
      await delete_items('freeTrades', this.selected)
      .then(async result => {
        if (result.error) {
          this.message(result.message, 3);
        } else {
          this.message(result.message, 1);
          this.freeTrades = await fetch_items(this.freeTradeCollRef);
          this.selected = [];
        }
      })
    },
    rowClick(item, row) {
      // row.select(!row.isSelected);
      this.detailDialog = true;
      this.nowItem = item;
      this.selected_forWhom = item.forWhom.name;
      this.selected_content = item.content;
      this.selected_price = item.price;
      this.selected_type = item.tradeType;
      if (item.forWhom.uid === this.user.uid) {
        if (this.attribute === 'parent') {
          this.approved_player = 'parent';
        }
        if (this.attribute === 'child') {
          this.approved_player = 'child';
        }
      } else {
        this.approved_player = 'none';
      }
    },
    async rejectedTrade() {
      await delete_items('freeTrades', [this.nowItem])
      .then(async result => {
        if (result.error) {
          this.message(result.message, 3);
        } else {
          this.message(result.message, 1);
          this.freeTrades = await fetch_items(this.freeTradeCollRef);
          this.nowItem = null;
        }
      })
      this.detailDialog = false;
    },
    async startCalc() {
      await caluculateBalance(this.nowItem, this.attribute)
      .then(async result => {
        if (result.error) {
          this.message(result.message, 3);
        } else {
          this.message(result.message, 1);
          this.freeTrades = await fetch_items(this.freeTradeCollRef);
          this.nowItem = null;
        }
      })
      this.detailDialog = false;
    },
    message(text, risk) {
      this.$store.commit("addMessage", {text, risk});
    },
  },
})
</script>
<style scss>
.input_case {
  font-family: 'serif'
}
</style>