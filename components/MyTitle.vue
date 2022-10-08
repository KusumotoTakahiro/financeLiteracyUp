<template>
  <div class="title">{{title}}</div>
</template>
<script>

export default {
  name: 'MyTitle',
  computed: {
    title: function() {
      console.log("computed");
      console.log(this.$store.state.title);
      return this.$store.getters.getTitle;
    }
  },
  watch: {
    title: function() {
      console.log("watch");
      console.log(this.$store.state.title);
      return this.$store.getters.getTitle;
    }
  }
}
</script>
<style>
.title {
  text-align: center;
  position: fixed; /* ウィンドウを基準に画面に固定 */
  top: 20px;
  width:500px;
  left: calc(50% - 250px);
  font-size: 50px;
}
</style>
