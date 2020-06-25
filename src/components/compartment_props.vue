<template>
  <div class="q-ma-sm">
    <q-card>
      <q-card-section class="q-pa-sm">
        <div class="text-overline text-center">
          {{ compartment.subtype }}
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-toggle
          v-model="compartment.is_enabled"
          size="xs"
          label="enabled"
          left-label
        />
        <q-input
          label="name"
          class="q-ma-sm"
          v-model="compartment.name"
          filled
          input-class="text-center"
        >
        </q-input>
        <q-input
          label="initial volume"
          class="q-ma-sm"
          v-model.number="compartment.initial_volume"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="unstressed volume"
          class="q-ma-sm"
          v-model.number="compartment.unstressed_volume"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="elastance baseline"
          class="q-ma-sm"
          v-model.number="compartment.el_baseline"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <q-input
          label="elastance contraction"
          class="q-ma-sm"
          v-model.number="compartment.el_contraction"
          filled
          type="number"
          input-class="text-center"
        >
        </q-input>

        <div v-show="advanced">
          <q-input
            label="fraction v-atp"
            class="q-ma-sm"
            v-model.number="compartment.fvatp"
            filled
            type="number"
            input-class="text-center"
          >
          </q-input>

          <q-input
            label="min linear volume"
            class="q-ma-sm"
            v-model.number="compartment.el_volumes.min"
            filled
            type="number"
            input-class="text-center"
          >
          </q-input>
          <q-input
            label="min linear volume constant"
            class="q-ma-sm"
            v-model.number="compartment.el_constants.min"
            filled
            type="number"
            input-class="text-center"
          >
          </q-input>

          <q-input
            label="max linear volume"
            class="q-ma-sm"
            v-model.number="compartment.el_volumes.max"
            filled
            type="number"
            input-class="text-center"
          >
          </q-input>
          <q-input
            label="max linear volume constant"
            class="q-ma-sm"
            v-model.number="compartment.el_constants.max"
            filled
            type="number"
            input-class="text-center"
          >
          </q-input>
        </div>
        <q-btn
          color="negative"
          @click="advanced = !advanced"
          size="sm"
          label="advanced"
        />
        <br />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      advanced: false,
      compartment: {
        is_enabled: true,
        name: "example",
        type: "component",
        subtype: "blood compartment",
        info: "",
        initial_volume: 20,
        unstressed_volume: 10,
        el_baseline: 2300,
        el_contraction: 1300,
        el_volumes: {
          min: 10,
          max: 50
        },
        el_constants: {
          min: 5,
          max: 55
        },
        fvatp: 0.2
      }
    };
  }
};
</script>

<style></style>
