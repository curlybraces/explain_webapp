<template>
  <div>
    <div class="q-gutter-sm q-ma-sm">
      <q-knob
        show-value
        class="text-primary q-ma-md"
        v-model="tv"
        :min="min_tv"
        :max="max_tv"
        size="100px"
        color="primary"
        track-color="grey-3"
      >
        <div class="text-center">
          <div>
            <small class="text-negative text-knob">tidal volume</small>
          </div>
          <div>{{ tv }}</div>
        </div>
      </q-knob>

      <q-knob
        show-value
        class="text-primary q-ma-md"
        v-model="mv"
        :min="min_mv"
        :max="max_mv"
        size="100px"
        color="primary"
        track-color="grey-3"
      >
        <div class="text-center">
          <div>
            <small class="text-negative text-knob">minute volume</small>
          </div>
          <div>{{ mv }}</div>
        </div>
      </q-knob>

      <q-knob
        show-value
        class="text-primary q-ma-md"
        v-model="flow"
        :min="min_flow"
        :max="max_flow"
        size="100px"
        color="primary"
        track-color="grey-3"
      >
        <div class="text-center">
          <div>
            <small class="text-negative text-knob">inspiratory flow</small>
          </div>
          <div>{{ flow }}</div>
        </div>
      </q-knob>
      <q-knob
        show-value
        class="text-primary q-ma-md"
        v-model="pip"
        :min="min_pip"
        :max="max_pip"
        size="100px"
        color="primary"
        track-color="grey-3"
      >
        <div class="text-center">
          <div>
            <small class="text-negative text-knob">peak pressure</small>
          </div>
          <div>{{ pip }}</div>
        </div>
      </q-knob>
      <q-knob
        show-value
        class="text-primary q-ma-md"
        v-model="peep"
        :min="min_peep"
        :max="max_peep"
        size="100px"
        color="primary"
        track-color="grey-3"
      >
        <div class="text-center">
          <div>
            <small class="text-negative text-knob">peep</small>
          </div>
          <div>{{ peep }}</div>
        </div>
      </q-knob>
      <q-knob
        show-value
        class="text-primary q-ma-md"
        v-model="freq"
        :min="min_freq"
        :max="max_freq"
        size="100px"
        color="primary"
        track-color="grey-3"
      >
        <div class="text-center">
          <div>
            <small class="text-negative text-knob">frequency</small>
          </div>
          <div>{{ freq }}</div>
        </div>
      </q-knob>
      <q-knob
        show-value
        class="text-primary q-ma-md"
        v-model="t_in"
        :min="min_tin"
        :max="max_tin"
        :step="step_t_in"
        size="100px"
        color="primary"
        track-color="grey-3"
      >
        <div class="text-center">
          <div>
            <small class="text-negative text-knob">inspiration time</small>
          </div>
          <div>{{ t_in }}</div>
        </div>
      </q-knob>
      <q-knob
        show-value
        class="text-primary q-ma-md"
        v-model="fio2"
        :min="min_fio2"
        :max="max_fio2"
        size="100px"
        color="primary"
        track-color="grey-3"
      >
        <div class="text-center">
          <div>
            <small class="text-negative text-knob">fio2</small>
          </div>
          <div>{{ fio2 }}</div>
        </div>
      </q-knob>
    </div>
    <q-btn @click="updateVentilatorSettings"> update </q-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      flow: 8,
      min_flow: 1,
      max_flow: 20,
      t_in: 0.4,
      min_tin: 0.2,
      max_tin: 5.0,
      step_t_in: 0.05,
      pip: 20.0,
      min_pip: 5,
      max_pip: 50,
      peep: 4,
      min_peep: 0,
      max_peep: 20,
      freq: 40,
      min_freq: 1,
      max_freq: 75,
      tv: 12,
      min_tv: 1,
      max_tv: 35,
      mv: 500,
      min_mv: 50,
      max_mv: 1500,
      fio2: 0.21,
      min_fio2: 0.21,
      max_fio2: 1
    };
  },
  methods: {
    updateVentilatorSettings() {
      let controls = {
        target_tidal_volume: this.tv / 1000,
        insp_flow: this.flow,
        //pip: this.pip,
        peep: this.peep / 1.35951,
        t_in: this.t_in,
        t_ex: 60 / this.freq - this.t_in
      };
      this.$model.sendMessageToModelEngine({
        type: "set",
        subtype: "model_settings",
        target: "ventilator",
        data: controls
      });
    }
  }
};
</script>

<style>
.text-knob {
  font-size: 10px;
}
</style>
