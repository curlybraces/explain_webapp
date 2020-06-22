<template>

  <div class="q-ma-sm chart">
  <div class="float-left">
      <GChart
        v-show="chart_visible"
        type="LineChart"
        :data="chart_data"
        :options="chart_options"
      ></GChart>
</div>
<div class="float-right">
      <GChart
        v-show="chart_visible"
        type="LineChart"
        :data="chart_data_pv"
        :options="chart_options_pv"
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
      data_update_interval: 0.014,

      chart_frame_size: 3,
      chart_frame_counter: 0,
      chart_frame_full: false,

      chart_update_counter: 0,
      chart_update_interval: 0.1,
      data: [],
      data_pv: [],
      chart_visible: true,
      chart_header: ["time", "flow (l/min)", "pressure (cmH2O)", "volume (ml)"],
      chart_header_pv: ["pressure (cmH2O)", "volume (ml)"],
      chart_data: [],
      chart_data_pv: [],
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
            max: 25,
            min: -10
          }
        },
        width: 800,
        height: 400,
        title: "ventilator graphs in time (sec)",
        curveType: "none"
      },
      chart_options_pv: {
        legend: { position: "bottom", alignment: "start" },
        explorer: {
          actions: ["dragToZoom", "rightClickToreset"],
          keepInBounds: true,
          maxZoomIn: 0.01
        },
        vAxis: {
          viewWindowMode: "explicit",
          viewWindow: {
            max: 25,
            min: 0
          }
        },
        width: 500,
        height: 400,
        title: "pressure - volume loop",
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

    this.chart_data_pv.push(this.chart_header_pv);
    this.chart_data_pv.push([0, 0]);
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
            _data.YPIECE_NCA.real_flow *
              60,
            (_data.YPIECE.pres_current - _data.metabolism.p_atm) * 1.35951,
            _data.ventilator.volume * 1000
          ]);

          this.data_pv.push([
            (_data.YPIECE.pres_current - _data.metabolism.p_atm) * 1.35951,
            _data.ventilator.volume * 1000
          ]);

          // this.data_pv.push([
            
          //   _data.ventilator.volume * 1000,
          //   _data.YPIECE_NCA.real_flow * 60,
          // ]);
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

          this.data_pv.forEach(p => {
            if (this.chart_frame_full) {
              this.chart_data_pv.splice(1, 1);
            }
            this.chart_data_pv.push(p);
          });
          this.data_pv = [];
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
