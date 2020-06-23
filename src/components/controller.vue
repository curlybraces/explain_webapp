<template>
  <div class="q-ma-sm">
    <q-card>
      <q-card-section class="q-pa-sm">
        <div class="text-overline text-center">model controls</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row q-gutter-xs justify-center">
          <q-btn
            color="negative"
            icon="play_arrow"
            @click="startModel"
            label=""
          />
          <q-btn
            color="negative"
            icon-right="pause"
            @click="stopModel"
            label=""
          />
          <q-btn
            color="negative"
            icon-right="autorenew"
            @click="stopModel"
            label=""
          />
        </div>
      </q-card-section>
    </q-card>
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
