<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      event_listener: null
    };
  }
};
</script>
