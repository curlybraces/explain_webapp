<template>
  <div class="q-gutter-xs q-ma-sm">
    <q-btn color="negative" icon="play_arrow" @click="startModel" label="" />
    <q-btn color="negative" icon-right="pause" @click="stopModel" label="" />
    <q-btn
      color="negative"
      icon-right="autorenew"
      @click="stopModel"
      label=""
    />
  </div>
</template>

<script>
export default {
  methods: {
    startModel() {
      this.$model.sendMessageToModelEngine({
        type: "cmd",
        subtype: "start",
        target: null,
        data: [5.0, 0.1]
      });
    },
    stopModel() {
      this.$model.sendMessageToModelEngine({
        type: "cmd",
        subtype: "stop",
        target: null,
        data: null
      });
    }
  }
};
</script>

<style></style>
