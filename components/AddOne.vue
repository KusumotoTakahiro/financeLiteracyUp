<template>
  <v-dialog
    v-model="dialog"
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
      <v-card-title class="justify-center">個別追加</v-card-title>
      <v-card-text>
        <template>
          <div>
            <div class="form-header">内容</div>
            <v-text-field
              v-model="content"
              clearable
              placeholder="内容を入力してください"
              dense
              outlined
              type="text"
              class="input_case"
            ></v-text-field>
          </div>
          <div>
            <div class="form-header">金額</div>
            <v-text-field
              v-model="price"
              clearable
              placeholder="金額を半角数字で入力してください"
              dense
              outlined
              type="tel"
              class="input_case"
            ></v-text-field>
            <v-btn
              class="black--text mt-5"
              block
              height="40"
              color=""
              @click="create_item()"
            >登録</v-btn>
          </div>
        </template>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          text
          @click="close_dialog()"
        >Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import {
  create_item,
  fetch_items,
} from '~/plugins/crudActions';
import {
  authStateChanged,
} from '@/plugins/auth'

export default ({
  data() {
    return {
      content: '',
      price: null,
    }
  },
  props: { 
    dialog: Boolean,
    subject: String,
    subjectCollRef: Object,
    rowNum: Number,
  },
  // ここいるっけ？いらんくないかね．
  computed: {
    getDialog() {
      return this.dialog;
    },
    getSubject() {
      return this.subject;
    },
    getSubjectCollRef() {
      return this.subjectCollRef;
    }
  },
  methods: {
    async create_item() {
      const user = await authStateChanged();
      const result = await create_item(user, this.subject, this.content, this.price, this.rowNum);
      console.log(this.rowNum)
      if (result.error) {
        this.message(result.message, 3);
      } else {
        this.message(result.message, 1);
        const items = await fetch_items(this.subjectCollRef);
        this.$emit('compAddOne', {items: items, dialog: false});
      }
    },
    async close_dialog() {
      const items = await fetch_items(this.subjectCollRef);
      this.$emit('compAddOne', {items: items, dialog: false});
    },
    /**
     * store経由でuserにアラートを数秒提示する関数．
     * @param {string} text - アラートに表示する内容．
     * @param {number} risk - アラートの色を指定する1が緑,2が黄色,3が赤
     */
    message(text, risk) {
      this.$store.commit("addMessage", {text, risk});
    }
  }
})
</script>