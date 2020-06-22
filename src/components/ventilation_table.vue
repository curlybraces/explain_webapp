<template>
  <div class="q-pa-sm">
    <q-table
      title=""
      dense
      hide-bottom
      :data="table_data"
      :columns="columns"
      row-key="name"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: true,
      color: "positive",
      buttonText: "hide",
      columns: [
        {
          required: true,
          label: "tidal volume",
          align: "center",
          field: "tv"
        },
        {
          required: true,
          label: "minute volume",
          align: "center",
          field: "mv"
        },
        {
          required: true,
          label: "flow",
          align: "center",
          field: "flow"
        },
        {
          required: true,
          label: "max pip",
          align: "center",
          field: "max_pip"
        },
        {
          required: true,
          label: "peep",
          align: "center",
          field: "peep"
        },
        {
          required: true,
          label: "frequency",
          align: "center",
          field: "freq"
        },
        {
          required: true,
          label: "insp time",
          align: "center",
          field: "t_in"
        },
        {
          required: true,
          label: "fio2",
          align: "center",
          field: "fio2"
        }
      ],
      table_data: [],
      table_update_counter: 0,
      table_update_interval: 1,
      table_visible: true,
      event_listener: null
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
  beforeDestroy() {
    //this.$model.modelEngine.removeEventListener(this.event_listener);
  },
  methods: {
    processData(_data) {
      if (this.table_visible) {
        // is it time to update the dataset?
        if (this.table_update_counter > this.table_update_interval) {
          this.table_update_counter = 0;
          this.table_data = [
            {
              tv:
                Math.round(_data.ventilator.inspiratory_tidal_volume * 1000) +
                "/" +
                Math.round(_data.ventilator.exhaled_tidal_volume * 1000),
              mv: Math.round(_data.ventilator.minute_volume * 1000),
              flow: _data.ventilator.insp_flow,
              max_pip: Math.round(_data.ventilator.plateau_pressure * 1.35951),
              peep: Math.round(_data.ventilator.peep * 1.35951),
              freq: Math.round(_data.ventilator.measured_freq),
              t_in: _data.ventilator.t_in,

              etco2: Math.round(_data.ventilator.etco2_ventilator)
            }
          ];
        }
        // increase the counters
        this.table_update_counter += _data.interval;
      }
    }
  }
};
</script>

<style>
#chart {
  width: 100%;
}
.testClass {
  font-size: 18px;
}
</style>
