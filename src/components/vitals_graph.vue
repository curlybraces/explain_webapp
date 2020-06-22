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
      data_update_interval: 1,

      chart_frame_size: 300,
      chart_frame_counter: 0,
      chart_frame_full: false,

      chart_update_counter: 0,
      chart_update_interval: 1,
      data: [],
      chart_visible: true,
      chart_header: ["time", "HR", "SAT", "SYST", "DIAST", "RR"],
      chart_data: [],
      chart_options: {
        legend: { position: "bottom", alignment: "start" },
        explorer: {
          actions: ["dragToZoom", "rightClickToreset"],
          keepInBounds: true,
          maxZoomIn: 0.01
        },
        vAxis: {
          viewWindowMode: "explicit",
          viewWindow: {
            max: 200,
            min: 0
          }
        },
        height: 400,
        title: "vital parameters in time (sec)",
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
          this.processData(_message.data.data);
        }
      }
    );

    this.chart_data.push(this.chart_header);
    this.chart_data.push([0, 0, 0, 0, 0, 0]);
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
      this.chart_data.push([0, 0, 0, 0, 0, 0]);
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
            _data.ecg.heart_rate,
            _data.AA.so2 * 100,
            _data.AA.pres_max,
            _data.AA.pres_min,
            _data.breathing.measured_spont_breath_freq
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
