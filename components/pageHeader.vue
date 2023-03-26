<template>
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
      elevation="2"> {{title}} 
    </v-alert>
  </div>
</template>
<script>
export default ({
  props: ['title']
})
</script>