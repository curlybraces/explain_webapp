<template>
  <div id="chart">
    <GChart
      v-show="chart_visible"
      type="LineChart"
      :data="chart_data"
      :options="chart_options"
    ></GChart>
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
      chart_visible: true,
      chart_data: {},
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
        title: "multiple parameters in time (sec)",
        curveType: "function"
      },
      event_listener: null
    };
  },
  mounted() {
    this.event_listener = this.$model.modelEngine.addEventListener(
      "message",
      _message => {
        if (_message.data.type === "data_rt") {
          this.processData(_message.data.data);
        }
      }
    );
  },
  beforeDestroy() {
    this.$model.modelEngine.removeEventListener(this.event_listener);
  },
  methods: {
    processData(_data) {
      if (this.chart_visible) {
        this.chart_data = _data;
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
