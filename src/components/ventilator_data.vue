<template>
  <div class="q-ma-sm">
    <q-card>
      <q-card-section class="q-pa-sm">
        <div class="text-overline text-center">ventilator measurements</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row q-gutter-sm justify-center">
          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="parameter-title text-center">
                tidal volume
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="parameter-value text-center">
                10
              </div>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="parameter-title text-center">
                minute volume
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="parameter-value text-center">
                10
              </div>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="parameter-title text-center">
                peak pressure
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="parameter-value text-center">
                10
              </div>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="parameter-title text-center">
                plateau pressure
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="parameter-value text-center">
                10
              </div>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="parameter-title text-center">
                peep
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="parameter-value text-center">
                10
              </div>
            </q-card-section>
          </q-card>
          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="parameter-title text-center">
                mean pressure
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="parameter-value text-center">
                10
              </div>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="parameter-title text-center">
                tube leak
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="parameter-value text-center">
                10
              </div>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="parameter-title text-center">
                compliance
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="parameter-value text-center">
                10
              </div>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="parameter-title text-center">
                resistance
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="parameter-value text-center">
                10
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tidal_volume: 0,
      minute_volume: 0,
      peak_pressure: 0,
      plateau_pressure: 0,
      peep: 0,
      mean_pressure: 0,
      tube_leak: 0,
      compliance: 0,
      resistance: 0,
      update_interval: 1,
      update_counter: 0,
      visible: true
    };
  },
  mounted() {
    this.event_listener = this.$model.modelEngine.addEventListener(
      "message",
      _message => {
        if (_message.data.type === "state") {
          this.processData(_message.data.data);
        }
      }
    );
  },
  methods: {
    processData(_data) {
      if (this.visible) {
        // is it time to update the dataset?
        if (this.update_counter > this.update_interval) {
          this.update_counter = 0;
          this.tidal_volume = Math.round(
            _data.ventilator.exhaled_tidal_volume * 1000
          );
          this.minute_volume = Math.round(
            _data.ventilator.minute_volume * 1000
          );
          this.peak_pressure = Math.round(
            _data.ventilator.plateau_pressure * 1.35951
          );
          this.plateau_pressure = Math.round(
            _data.ventilator.plateau_pressure * 1.35951
          );
          this.peep = Math.round(_data.ventilator.peep * 1.35951);
          this.tube_leak = 0;
        }
        // increase the counters
        this.table_update_counter += _data.interval;
      }
    }
  }
};
</script>

<style>
.parameter-title {
  font-size: 10px;
  color: red;
}
.parameter-value {
  font-size: 18px;
  color: black;
}
</style>
