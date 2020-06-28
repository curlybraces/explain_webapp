<template>
  <div class="q-ma-sm">
    <q-card>
      <q-card-section class="q-pa-sm">
        <div class="text-overline text-center">
          {{ name }}
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-toggle
          label="is enabled"
          left-label
          size="xs"
          v-model="is_enabled"
        ></q-toggle>

        <q-input
          label="type"
          class="q-ma-sm"
          v-model="type"
          filled
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="subtype"
          class="q-ma-sm"
          v-model="subtype"
          filled
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="initial volume"
          class="q-ma-sm"
          v-model="vol_current_baseline"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="unstressed volume"
          class="q-ma-sm"
          v-model="vol_unstressed_baseline"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="elastance"
          class="q-ma-sm"
          v-model="el_baseline"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <q-input
          v-if="subtype === 'pump'"
          label="elastance contraction"
          class="q-ma-sm"
          v-model="el_contraction_baseline"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="linear elastance min vol"
          class="q-ma-sm"
          v-model="el_min_volume"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="linear elastance max vol"
          class="q-ma-sm"
          v-model="el_max_volume"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="linear elastance min k1"
          class="q-ma-sm"
          v-model="el_k1"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="linear elastance max k2"
          class="q-ma-sm"
          v-model="el_k2"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      event_listener: null,
      name: "",
      type: "component",
      subtype: "",
      info: "",
      vol_unstressed_baseline: 0,
      vol_current_baseline: 0,
      el_baseline: 0,
      el_contraction_baseline: 0,
      el_min_volume: 0,
      el_max_volume: 0,
      el_k1: 0,
      el_k2: 0,
      fvatp: 0,
      is_enabled: false
    };
  },
  mounted() {
    this.event_listener = this.$model.modelEngine.addEventListener(
      "message",
      _message => {
        if (_message.data.type === "model_state") {
          //console.log(_message.data.data);
          this.processData(_message.data.data);
        }
      }
    );
  },
  methods: {
    getData(comp_name) {
      this.name = comp_name;
      this.$model.sendMessageToModelEngine({
        type: "get",
        subtype: "model_state",
        target: null,
        data: null
      });
    },
    processData(model_state) {
      console.log(model_state[this.name]);
      this.name = model_state[this.name].name;
      this.type = model_state[this.name].type;
      this.subtype = model_state[this.name].subtype;
      this.info = model_state[this.name].info;
      this.vol_unstressed_baseline =
        model_state[this.name].vol_unstressed_baseline;
      this.vol_current_baseline = model_state[this.name].vol_current_baseline;

      this.el_baseline = model_state[this.name].el_baseline;
      this.el_contraction_baseline =
        model_state[this.name].el_contraction_baseline;
      this.el_min_volume = model_state[this.name].el_min_volume;
      this.el_max_volume = model_state[this.name].el_max_volume;
      this.el_k1 = model_state[this.name].el_k1;
      this.el_k2 = model_state[this.name].el_k2;
      this.is_enabled = model_state[this.name].is_enabled;
    }
  }
};
</script>

<style></style>
