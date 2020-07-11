<template>
  <div>
    <div :id="chartId" class="fill"></div>
  </div>
</template>

<script>
import {
  Point,
  SolidLine,
  SolidFill,
  MPoint,
  LineSeries,
  ChartXY,
  DashboardBasicOptions,
  AxisTickStrategies,
  Dashboard,
  lightningChart,
  Themes,
  DataPatterns,
  AxisScrollStrategies,
  FormattingRange,
  UIElementBuilders,
  UIOrigins,
  ColorHEX,
  VisibleTicks,
  IntensityGridSeries,
  ColorRGBA,
  LUT,
  PalettedFill,
  Axis,
  emptyLine,
  emptyTick,
  emptyFill
} from "@arction/lcjs";

export default {
  name: "Chart",
  data() {
    // Add the chart to the data in a way that Vue will not attach it's observers to it.
    // If the chart variable would be added in the return object, Vue would attach the observers and
    // every time LightningChart JS made a change to any of it's internal variables, vue would try to observe the change and update.
    // Observing would slow down the chart a lot.

    return {
      chartId: null,
      channels: [
        {
          component: "LV",
          parameter: "pres_current",
          factor: 1.0,
          offset: 0,
          color: "#00f",
          width: 1
        },
        {
          component: "LA",
          parameter: "vol_current",
          factor: 1000.0,
          offset: 0,
          color: "#f00",
          width: 1
        },
        {
          component: "ecg",
          parameter: "ecg_signal",
          factor: 0.3,
          offset: 20,
          color: "#000",
          width: 1
        }
      ],
      title: "left ventricle pressure",
      numberOfDatapoints: 333,
      series: []
    };
  },
  methods: {
    createDashboard() {
      this.dashboard = lightningChart()
        .Dashboard({
          containerId: `${this.chartId}`,
          numberOfColumns: 1,
          numberOfRows: 1,
          theme: Themes.light
        })
        .setSplitterStyle(style => style.setThickness(5));
    },
    createChart(_channels) {
      // Configure chart -> chartXY
      let _chart = this.dashboard.createChartXY({
        columnIndex: 0,
        columnSpan: 1,
        rowIndex: 0,
        rowSpan: 1,
        defaultAxisXTickStrategy: AxisTickStrategies.Numeric
      });

      _chart.setTitle(this.title);

      // Configurure axes
      let _xAxis = _chart
        .getDefaultAxisX()
        .setScrollStrategy(AxisScrollStrategies.progressive)
        .setInterval(0, 5);

      let _yAxis = _chart
        .getDefaultAxisY()
        .setScrollStrategy(undefined)
        .setInterval(0, 100);

      // add a lineseries for each channel
      this.numberOfDatapoints = 333;
      _channels.forEach(channel => {
        const serie = _chart
          .addLineSeries({ dataPattern: DataPatterns.horizontalProgressive })
          .setName(channel.component)
          .setMaxPointCount(this.numberOfDatapoints)
          .setStrokeStyle(style =>
            style.setFillStyle(fill => fill.setColor(ColorHEX(channel.color)))
          )
          .setStrokeStyle(style => style.setThickness(channel.width));

        this.series.push(serie);
      });

      return _chart;
    },
    processData(_data) {
      this.channels.forEach((channel, i) => {
        switch (channel.parameter) {
          case "pv_hires":
            _data[channel.component].pv.forEach(data => {
              this.series[i].add({
                x: data.p,
                y: data.v * channel.factor
              });
            });
            break;
          case "vp_hires":
            _data[channel.component].pv.forEach(data => {
              this.series[i].add({
                x: data.v * channel.factor,
                y: data.p
              });
            });
            break;
          case "p_hires":
            _data[channel.component].pv.forEach(data => {
              this.series[i].add({
                x: data.t,
                y: data.p * channel.factor
              });
            });
            break;
          case "v_hires":
            _data[channel.component].pv.forEach(data => {
              this.series[i].add({
                x: data.t,
                y: data.v * channel.factor
              });
            });
            break;
          default:
            this.series[i].add({
              x: _data.time,
              y:
                _data[channel.component][channel.parameter] * channel.factor +
                channel.offset,
              color: "#0FF0000"
            });
            break;
        }
      });
    }
  },
  beforeMount() {
    // Generate random ID to us as the containerId for the chart and the target div id
    this.chartId = Math.trunc(Math.random() * 1000000);
  },
  mounted() {
    this.createDashboard();
    this.chart = this.createChart(this.channels);
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
  height: 300px;
  width: 75%;
}
</style>
