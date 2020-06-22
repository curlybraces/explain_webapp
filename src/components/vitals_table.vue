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
          label: "heartrate",
          align: "center",
          field: "hr"
        },
        {
          required: true,
          label: "spo2-pre (%)",
          align: "center",
          field: "sat_pre"
        },
        {
          required: true,
          label: "spo2-post (%)",
          align: "center",
          field: "sat_post"
        },
        {
          required: true,
          label: "spo2-ven (%)",
          align: "center",
          field: "sat_ven"
        },
        {
          required: true,
          label: "abp",
          align: "center",
          field: "abp"
        },
        {
          required: true,
          label: "pap",
          align: "center",
          field: "pap"
        },
        ,
        {
          required: true,
          label: "cvp",
          align: "center",
          field: "cvp"
        },
        {
          required: true,
          label: "resprate",
          align: "center",
          field: "rr"
        },
        {
          required: true,
          label: "etco2",
          align: "center",
          field: "etco2"
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
              hr: Math.round(_data.ecg.heart_rate),
              sat_pre: Math.round(_data.AA.so2 * 100),
              sat_post: Math.round(_data.AD.so2 * 100),
              sat_ven: Math.round(_data.IVC.so2 * 100),
              abp:
                Math.round(_data.AA.pres_max) +
                "/" +
                Math.round(_data.AA.pres_min),
              rr: Math.round(
                (_data.breathing.measured_spont_breath_freq +
                  _data.ventilator.measured_freq) /
                  2
              ),
              cvp: Math.round(_data.RA.pres_current),
              pap:
                Math.round(_data.PA.pres_max) +
                "/" +
                Math.round(_data.PA.pres_min),
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
