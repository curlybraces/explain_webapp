<template>
  <div :id="chartId"></div>
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
      charts: []
    };
  },
  methods: {
    createDashboard(_dashboardProps) {
      this.dashboard = lightningChart()
        .Dashboard(_dashboardProps)
        .setSplitterStyle(style => style.setThickness(5))
        .setHeight(_dashboardProps.height)
        .setWidth(_dashboardProps.width)
        .setSplitterStyle(
          new SolidLine({
            thickness: 2,
            fillStyle: new SolidFill({ color: ColorHEX("#ddd") })
          })
        );
    },
    createChart(_chartProps) {
      // Configure chart -> chartXY
      let _chart = this.dashboard.createChartXY({
        columnIndex: _chartProps.columnIndex,
        columnSpan: _chartProps.columnSpan,
        rowIndex: _chartProps.rowIndex,
        rowSpan: _chartProps.rowSpan,
        defaultAxisXTickStrategy: AxisTickStrategies.Numeric
      });
      _chart.setTitle(_chartProps.title);
      _chart.setPadding({
        top: _chartProps.padding_top,
        bottom: _chartProps.padding_bottom,
        left: _chartProps.padding_left,
        right: _chartProps.padding_right
      });
      _chart.channels = _chartProps.channels;
      _chart.series = [];

      // Configurure axes
      let _xAxis = _chart
        .getDefaultAxisX()
        .setScrollStrategy(AxisScrollStrategies.progressive)
        .setInterval(_chartProps.min_x, _chartProps.max_x);

      let _yAxis = _chart
        .getDefaultAxisY()
        .setScrollStrategy(undefined)
        .setInterval(_chartProps.min_y, _chartProps.max_y);

      // add a lineseries for each channel
      _chartProps.channels.forEach(channel => {
        const serie = _chart
          .addLineSeries({ dataPattern: DataPatterns.horizontalProgressive })
          .setName(channel.component)
          .setMaxPointCount(333)
          .setStrokeStyle(style =>
            style.setFillStyle(fill => fill.setColor(ColorHEX(channel.color)))
          )
          .setStrokeStyle(style => style.setThickness(channel.width));

        _chart.series.push(serie);
      });

      return _chart;
    },
    updateData(_data) {
      this.charts.forEach(chart => {
        this.processData(chart, _data);
      });
    },
    processData(_chart, _data) {
      _chart.channels.forEach((channel, i) => {
        switch (channel.parameter) {
          case "pv_hires":
            _data[channel.component].pv.forEach(data => {
              _chart.series[i].add({
                x: data.p,
                y: data.v * channel.factor
              });
            });
            break;
          case "vp_hires":
            _data[channel.component].pv.forEach(data => {
              _chart.series[i].add({
                x: data.v * channel.factor,
                y: data.p
              });
            });
            break;
          case "p_hires":
            _data[channel.component].pv.forEach(data => {
              _chart.series[i].add({
                x: data.t,
                y: data.p * channel.factor
              });
            });
            break;
          case "v_hires":
            _data[channel.component].pv.forEach(data => {
              _chart.series[i].add({
                x: data.t,
                y: data.v * channel.factor
              });
            });
            break;
          default:
            _chart.series[i].add({
              x: _data.time,
              y:
                _data[channel.component][channel.parameter] * channel.factor +
                channel.offset,
              color: "#0FF0000"
            });
            break;
        }
      });
    },
    initializeDashboard(_dashboardProps, _charts) {
      _dashboardProps = {
        height: 300,
        width: 1000,
        containerId: `${this.chartId}`,
        numberOfColumns: 2,
        numberOfRows: 1,
        theme: Themes.light
      };
      this.createDashboard(_dashboardProps);

      _charts = [
        {
          title: "ventricular pressures",
          columnIndex: 0,
          columnSpan: 1,
          rowIndex: 0,
          rowSpan: 1,
          padding_top: 5,
          padding_bottom: 5,
          padding_left: 5,
          padding_right: 20,
          min_x: 0,
          max_x: 5,
          min_y: 0,
          max_y: 100,
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
              component: "RV",
              parameter: "pres_current",
              factor: 1.0,
              offset: 0,
              color: "#00f",
              width: 1
            }
          ]
        },
        {
          title: "atrial pressures",
          columnIndex: 1,
          columnSpan: 1,
          rowIndex: 0,
          rowSpan: 1,
          padding_top: 5,
          padding_bottom: 5,
          padding_left: 5,
          padding_right: 20,
          min_x: 0,
          max_x: 5,
          min_y: 0,
          max_y: 10,
          channels: [
            {
              component: "LA",
              parameter: "pres_current",
              factor: 1.0,
              offset: 0,
              color: "#f0f",
              width: 1
            },
            {
              component: "RA",
              parameter: "pres_current",
              factor: 1.0,
              offset: 0,
              color: "#f0f",
              width: 1
            }
          ]
        }
      ];

      _charts.forEach(chartProps => {
        this.charts.push(this.createChart(chartProps));
      });

      this.event_listener = this.$model.modelEngine.addEventListener(
        "message",
        _message => {
          if (_message.data.type === "state") {
            this.updateData(_message.data.data);
          }
        }
      );
    }
  },
  beforeMount() {
    // Generate random ID to us as the containerId for the chart and the target div id
    this.chartId = Math.trunc(Math.random() * 1000000);
  },
  mounted() {
    this.initializeDashboard(null, ["chart1"]);
  },

  beforeDestroy() {
    // "dispose" should be called when the component is unmounted to free all the resources used by the chart
    this.dashboard = null;
    this.charts = null;
  }
};
</script>

<style scoped></style>
