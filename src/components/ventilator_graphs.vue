<template>
  <div id="chart">
    <div>
      <GChart
        v-show="chart_visible"
        type="LineChart"
        :data="chart_data"
        :options="chart_options"
      ></GChart>
    </div>
  </div>
</template>

<script>
import { GChart } from "vue-google-charts";

export default {
  components: {
    GChart
  },
  data() {
    return {
      visible: true,
      color: "positive",
      buttonText: "hide",
      data_update_counter: 0,
      data_update_interval: 0.03,

      chart_frame_size: 5,
      chart_frame_counter: 0,
      chart_frame_full: false,

      chart_update_counter: 0,
      chart_update_interval: 0.075,
      data: [],
      chart_visible: true,
      chart_header: ["time", "flow (l/min)", "pressure (cmH2O)", "volume (ml)"],
      chart_data: [],
      chart_options: {
        legend: { position: "bottom", alignment: "start" },
        explorer: {
          actions: ["dragToZoom", "rightClickToreset"],
          keepInBounds: true,
          maxZoomIn: 0.01
        },
        height: 300,
        title: "ventilator graphs in time (sec)",
        curveType: "function"
      },
      event_listener: null
    };
  },
  mounted() {
    this.event_listener = this.$model.modelEngine.addEventListener(
      "message",
      _message => {
        if (_message.data.type === "state") {
          //console.log(_message.data.data);
          this.processData(_message.data.data);
        }
      }
    );

    this.chart_data.push(this.chart_header);
    this.chart_data.push([0, 0, 0, 0]);
  },
  beforeDestroy() {
    //this.$model.modelEngine.removeEventListener(this.event_listener);
  },
  methods: {
    resetGraph() {
      this.chart_frame_full = false;
      this.data = [];
      this.chart_data = [];
      this.chart_data.push(this.chart_header);
      this.chart_data.push([0, 0]);
      this.data_update_counter = 0;
      this.chart_update_counter = 0;
      this.chart_frame_counter = 0;
    },
    processData(_data) {
      if (this.chart_visible) {
        // is it time to update the dataset?
        if (this.data_update_counter > this.data_update_interval) {
          this.data_update_counter = 0;
          this.data.push([
            _data.time,
            (_data.TUBINGIN_YPIECE.real_flow -
              _data.YPIECE_TUBINGOUT.real_flow) *
              60,
            (_data.YPIECE.pres_current - _data.metabolism.p_atm) * 1.35951,
            _data.ventilator.volume * 1000
          ]);
        }

        // is it time to draw the graph
        if (this.chart_update_counter > this.chart_update_interval) {
          this.chart_update_counter = 0;
          this.data.forEach(p => {
            if (this.chart_frame_full) {
              this.chart_data.splice(1, 1);
            }
            this.chart_data.push(p);
          });
          this.data = [];
        }

        // check whether the chart data frame is reached
        if (this.chart_frame_counter > this.chart_frame_size) {
          this.chart_frame_full = true;
        }

        // increase the counters
        this.data_update_counter += _data.interval;
        this.chart_update_counter += _data.interval;
        this.chart_frame_counter += _data.interval;
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
