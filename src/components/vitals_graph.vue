<template>
  <div id="chart">
    <GChart
      v-show="chart_visible"
      type="LineChart"
      :data="chart_data"
      :options="chart_options"
    ></GChart>

    <button @click="startModel">START</button>
    <button @click="stopModel">STOP</button>
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
      data_update_counter : 0,
      data_update_interval : 0.03,
      data_frame_size : 5,
      chart_update_counter : 0,
      chart_update_interval : 0.1,
      data: [],
      chart_visible: true,
      chart_header: ['time', 'HR', 'SAT', 'SYST', 'DIAST', 'RR'],
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
          this.processVitals(_message.data.data);
        }
      }
    );

    this.chart_data.push(this.chart_header)

  },
  beforeDestroy() {
    this.$model.modelEngine.removeEventListener(this.event_listener);
  },
  methods: {
    processVitals(_data) {
      if (this.chart_visible) {    

        if (this.data_update_counter > this.data_update_interval)
        {
          this.data_update_counter = 0
          this.data.push([_data.time, _data.ecg.heart_rate, 
          _data.AA.so2 * 100, _data.AA.pres_current, 
          _data.AA.pres_min, 
          _data.breathing.measured_spont_breath_freq])
        }

        if (this.chart_update_counter > this.chart_update_interval)
        {
          this.chart_update_counter = 0
          this.data.forEach( p => {
            this.chart_data.push(p)
          })
          this.data = []
        }

        this.data_update_counter += _data.interval
        this.chart_update_counter += _data.interval
      }


    },
    startModel() {
      this.$model.sendMessageToModelEngine({
        type: "cmd",
        subtype: "start",
        target: null,
        data: [5.0, 0.1]
      });
    },
    stopModel() {
      this.$model.sendMessageToModelEngine({
        type: "cmd",
        subtype: "stop",
        target: null,
        data: null
      });
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
