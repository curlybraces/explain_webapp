<template>
  <div class="q-ma-sm">
    <q-card>
      <q-card-section class="q-pa-sm">
        <div class="text-overline text-center">
          model properties
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-select
          filled
          dense
          v-model="selection"
          @input="selectionChanged"
          :options="model_list"
          label="models"
        />
      </q-card-section>
      <q-card-section>
        <q-separator />
        <div v-for="(value, property, index) in model" :key="index">
          <q-toggle
            v-if="typeof model[property] === 'boolean'"
            :label="property"
            left-label
            size="xs"
            v-model="model[property]"
          ></q-toggle>

          <q-input
            v-if="typeof model[property] === 'string'"
            :label="property"
            class="q-ma-sm"
            v-model="model[property]"
            filled
            input-class="text-center"
          >
          </q-input>

          <q-input
            v-if="typeof model[property] === 'number'"
            :label="property"
            class="q-ma-sm"
            v-model="model[property]"
            filled
            type="number"
            input-class="text-center"
          >
          </q-input>
        </div>

        <q-btn
          color="negative"
          size="sm"
          @click="getData('breathing')"
          label="UPDATE"
        />

        <q-btn
          class="q-ma-sm"
          color="negative"
          size="sm"
          @click="getModelData('')"
          icon="fas fa-sync-alt"
          label=""
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      event_listener: null,
      selection: "",
      model_list: [],
      model_name: "AA",
      model: {}
    };
  },
  mounted() {
    this.event_listener = this.$model.modelEngine.addEventListener(
      "message",
      _message => {
        if (_message.data.type === "model_props") {
          this.processData(_message.data.data);
        }
      }
    );
  },
  methods: {
    selectionChanged() {
      this.getModelData(this.selection);
    },
    getModelData(model_name) {
      this.model_name = model_name;
      this.$model.sendMessageToModelEngine({
        type: "get",
        subtype: "model_props",
        target: null,
        data: null
      });
    },
    updateComponentProps() {},
    processData(model_state) {
      this.model = {};

      // build model list
      this.model_list = [];
      Object.keys(model_state).forEach(key => {
        if (model_state[key].type === "model") {
          this.model_list.push(model_state[key].name);
        }
      });

      Object.keys(model_state[this.model_name]).forEach(prop => {
        if (typeof model_state[this.model_name][prop] === "number") {
          if (!prop.includes("counter") & !prop.includes("prev")) {
            this.$set(this.model, prop, model_state[this.model_name][prop]);
          }
        }
      });
    }
  }
};
</script>

<style></style>
