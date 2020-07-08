<template>
  <div :id="chartId" class="fill"></div>
</template>

<script>
import {
  lightningChart,
  DataPatterns,
  AxisScrollStrategies,
  emptyFill,
  emptyTick,
  UIOrigins,
  emptyLine,
  SeriesXYFormatter,
  LineSeries,
  UILayoutBuilders,
  UIDraggingModes,
  UIElementBuilders,
  SolidFill,
  ColorHEX,
  UIBackgrounds,
  AxisTickStrategies,
  SolidLine,
  ColorRGBA,
  Themes
} from "@arction/lcjs";

export default {
  name: "Chart",
  data() {
    // Add the chart to the data in a way that Vue will not attach it's observers to it.
    // If the chart variable would be added in the return object, Vue would attach the observers and
    // every time LightningChart JS made a change to any of it's internal variables, vue would try to observe the change and update.
    // Observing would slow down the chart a lot.
    this.chart = null;
    return {
      chartId: null,
      title: "left ventricle pressure",
      numberOfDatapoints: 333,
      series1: null,
      series2: null,
      axisX: null,
      axisY: null,
      minY: 0,
      maxY: 100,
      x_window: 5
    };
  },
  methods: {
    createChart() {
      // Create chartXY
      this.chart = lightningChart().ChartXY({
        theme: Themes.light,
        containerId: `${this.chartId}`,
        defaultAxisXTickStrategy: AxisTickStrategies.Numeric
      });
      this.chart.setTitle(this.title);

      // Configurure Axes Scrolling modes.
      this.axisX = this.chart.getDefaultAxisX();
      // Scroll along with incoming data.
      this.axisX.setScrollStrategy(AxisScrollStrategies.progressive);
      this.axisX.setInterval(0, this.x_window);

      this.axisY = this.chart.getDefaultAxisY();
      // Keep same interval always.
      this.axisY.setScrollStrategy(undefined);
      this.axisY.setInterval(this.minY, this.maxY);

      this.series1 = this.chart
        .addLineSeries({ dataPattern: DataPatterns.horizontalProgressive })
        .setMaxPointCount(this.numberOfDatapoints * 5);
      this.series2 = this.chart
        .addLineSeries({ dataPattern: DataPatterns.horizontalProgressive })
        .setMaxPointCount(this.numberOfDatapoints * 5);

      this.series1.setStrokeStyle(style => style.setThickness(1));
      this.series2.setStrokeStyle(style => style.setThickness(1));
    },
    processData(_data) {
      // _data["LV"].pv.forEach(data => {
      //   this.series1.add({
      //     x: data.t,
      //     y: data.v
      //   });
      // });

      this.series1.add({ x: _data.time, y: _data["LV"].vol_current * 1000 });
      this.series2.add({ x: _data.time, y: _data["LV"].pres_current });
      //console.log(_data["LV"].pressures);
    }
  },
  beforeMount() {
    // Generate random ID to us as the containerId for the chart and the target div id
    this.chartId = Math.trunc(Math.random() * 1000000);
  },
  mounted() {
    this.createChart();
    this.event_listener = this.$model.modelEngine.addEventListener(
      "message",
      _message => {
        if (_message.data.type === "state") {
          //console.log(_message.data.data);
          this.processData(_message.data.data);
        }
      }
    );
  },
  beforeDestroy() {
    // "dispose" should be called when the component is unmounted to free all the resources used by the chart
    this.chart.dispose();
  }
};
</script>

<style scoped>
.fill {
  height: 500px;
  width: 100%;
}
</style>
