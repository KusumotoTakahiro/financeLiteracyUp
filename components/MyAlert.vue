<style scoped>
.alert {
  z-index: 307;
  position: fixed;
  top: 20px;
  margin: 5px auto;
  left: 0;
  right: 0;
  width: calc(100% - 20px);
  max-width: 800px;
}
</style>
<template>
  <transition name="downup" @after-leave="leave">
    <v-alert v-model="alert"
      v-if="check()"
      class="alert white--text darken-1"
      :type="risks[mMessages[0].risk]"
      border="left" :dismissible="mMessages[0].dismissible"
      elevation="10">
      <div class="pl-2">{{ mMessages[0].text }}</div>
    </v-alert>
  </transition>
</template>

<script>
//NOTE:自作アラートコンポーネント

export default {
  name: "MyAlert",
  data: () => ({
    risks: ["success", "info", "warning", "error"],
    alert: false,
    showing: false,
  }),
  methods: {
    leave() {
      this.showing = false;
      this.alert = true;
      if (this.mMessages.length > 0) {
        // this.mMessages.shift();
        this.$store.commit('removeMessage');
      }
    },
    nextMessage() {
      this.showing = false;
    },
    check() {
      let m = this.mMessages;
      return m.length > 0 && this.showing && this.alert;
    },
    kataCheck(x) {
      return (x != x)? "NaN": (x === Infinity || x === -Infinity)? "Infinity": Object.prototype.toString.call(x).slice(8, -1);
    }
  },
  computed: {
    mMessages: function () {
      return this.$store.getters.getMessages;
    },
  },
  watch: {
    mMessages: function () {
      if (this.showing) {
        return;
      }
      let message = this.mMessages[0];
      if (this.mMessages.length > 0) {
        this.alert = true;
        this.showing = true;
        // console.log(message.text);
        if (!message.dismissible) {
          setTimeout(this.nextMessage, message.time * 1000);
        }
      }
    },
  }
}
</script>