class Datalogger {
  constructor(_model) {
    // declare a reference to the global model which is injected in this class
    this.model = _model;

    this.data_object = [];
    this.data_vitals_object = [];

    // declare a list to hold all data
    this.header_custom = [];
    this.header_on_custom = false;
    this.data_custom = [];

    this.header_vitals = [];
    this.header_on_vitals = false;
    this.vitals = [];

    // declare the default datalogger configuration
    this.configuration_custom = [
      {
        type: "time",
        label: "time",
        name: "time",
        property: "",
        multiplier: 1000.0,
        offset: 0.0
      },
      {
        type: "component",
        label: "LV_vol",
        name: "LV",
        property: "vol_current",
        multiplier: 1000.0,
        offset: 0.0
      },
      {
        type: "component",
        label: "LV_pres",
        name: "LV",
        property: "pres_current",
        multiplier: 1.0,
        offset: 0.0
      }
    ];

    this.configuration_vitals = [
      {
        type: "time",
        label: "time",
        name: "time",
        property: "time",
        multiplier: 1000.0,
        offset: 0.0
      },
      {
        type: "model",
        label: "HR",
        name: "ecg",
        property: "heart_rate",
        multiplier: 1.0,
        offset: 0.0
      },
      {
        type: "component",
        name: "AA",
        label: "SAT",
        property: "so2",
        multiplier: 100,
        offset: 0.0
      },
      {
        type: "component",
        name: "AA",
        label: "SYST",
        property: "pres_max",
        multiplier: 1,
        offset: 0.0
      },
      {
        type: "component",
        name: "AA",
        label: "DIAST",
        property: "pres_min",
        multiplier: 1,
        offset: 0.0
      },
      {
        type: "model",
        label: "RR",
        name: "breathing",
        property: "spont_resp_rate",
        multiplier: 1,
        offset: 0.0
      }
    ];

    // declare the default datalogger interval
    this.interval_custom = current_model.modeling_interval;

    // declare the vitals datalogger interval to 1 second
    this.interval_vitals = 1;

    // this determines whether or not to clear the datalogger after a model run
    this.empty_after_run = true;

    // declare the datalogger timer
    this.datalogger_timer_custom = 0;

    // declare the datalogger vitals timer
    this.datalogger_timer_vitals = 0;

    // realtime mode
    this.realtime = false;
    this.realtime_window_custom = 10;
    this.realtime_timer_custom = 0;

    // vitals data shift
    this.vitals_shift_window = 60;
    this.vitals_shift_timer = 0;

    this.annotations_processed = false;
  }

  SendMessage = function(type_mes, subtype_mes, target_mes, data_mes) {
    postMessage({
      id: ID,
      type: type_mes,
      subtype: subtype_mes,
      target: target_mes,
      data: data_mes
    });
  };

  emptyAfterRun() {
    if (this.emptyAfterRun) {
      this.emptyDatalogger();
    }
  }

  emptyDatalogger() {
    // clear the data object
    this.data_custom = [];
    this.header_on_custom = false;
  }

  emptyDataloggerVitals() {
    // clear the data object
    this.vitals = [];
  }

  setDataLlogger(_config) {
    this.emptyDatalogger();
    this.configuration_custom = _config;
  }

  setDataloggerVitals(_config) {
    this.emptyDataloggerVitals();
    this.configuration_vitals = _config;
  }

  resetDatalogger() {
    // reset the data object
    this.data_custom = [];
    this.header_on_custom = false;
    this.configuration_custom = [];
  }

  switchRealtimeMode(mode, rt_window = 10) {
    if (mode) {
      this.emptyDatalogger();
      this.realtime = true;
      this.realtime_timer_custom = 0;
      this.realtime_window_custom = rt_window;
    } else {
      this.emptyDatalogger();
      this.realtime = false;
      this.realtime_timer_custom = 0;
    }
  }

  getRealtimeData() {
    if (!this.header_on_custom) {
      this.header_custom = this.getHeader();
      this.data_custom.unshift(this.header_custom);
    }

    this.header_on_custom = true;
    return this.data_custom;
  }

  getVitalsData() {
    if (!this.header_vitals_on) {
      this.header_vitals = this.getHeaderVitals();
      this.vitals.unshift(this.header_vitals);
    }

    this.header_vitals_on = true;
    return this.vitals;
  }

  getLoggerData() {
    if (!this.header_on_custom) {
      this.data_custom.unshift(this.getHeader());
    }

    this.header_on_custom = true;
    return this.data_custom;
  }

  getHeaderVitals() {
    let header = [];

    this.configuration_vitals.forEach(datalog => {
      header.push(datalog["label"]);
    });
    return header;
  }

  getHeader() {
    let header = [];

    this.configuration_custom.forEach(datalog => {
      header.push(datalog["label"]);
    });
    return header;
  }
  modelStep(_current_model_time, annotations) {
    // has the datalogger time interval elapsed? then store the data in the data list
    if (this.datalogger_timer_custom >= this.interval_custom) {
      // iterate over the configuration object
      this.data_object = [];

      this.configuration_custom.forEach(datalog => {
        let property_value = 0;
        // if the type is a component find the value in de components list otherwise in the model list
        switch (datalog.type) {
          case "component":
            property_value =
              this.model.components[datalog.name][datalog.property] *
                datalog.multiplier +
              datalog.offset;
            break;
          case "model":
            property_value =
              this.model.models[datalog.name][datalog.property] *
                datalog.multiplier +
              datalog.offset;
            break;
          case "time":
            property_value = _current_model_time;
            break;
        }
        this.data_object.push(property_value);
      });

      this.realtime_timer_custom += this.interval_custom;
      if (
        (this.realtime_timer_custom > this.realtime_window_custom) &
        this.realtime
      ) {
        this.data_custom.shift();
        this.data_custom.splice(0, 1, this.header_custom);
      }
      this.data_custom.push(this.data_object);

      // reset the datalogger timer
      this.datalogger_timer_custom = 0;
    }

    // the vitals have a separate datalog
    if (this.datalogger_timer_vitals >= this.interval_vitals) {
      this.data_vitals_object = [];
      this.configuration_vitals.forEach(datalog => {
        let property_value = 0;
        // if the type is a component find the value in de components list otherwise in the model list
        switch (datalog.type) {
          case "component":
            property_value =
              this.model.components[datalog.name][datalog.property] *
                datalog.multiplier +
              datalog.offset;
            break;
          case "model":
            property_value =
              this.model.models[datalog.name][datalog.property] *
                datalog.multiplier +
              datalog.offset;
            break;
          case "time":
            property_value = _current_model_time;
            break;
        }
        this.data_vitals_object.push(property_value);
      });

      // push the annotations text to the data object
      //this.data_vitals_object.push(annotations.text);

      // set the flag that the annotations are processed so they can be cleared in the intervention class
      // preventing double entries
      this.annotations_processed = true;

      // check whether the data window of the vitals has not been reached (now at 60 seconds)
      this.vitals_shift_timer += this.interval_vitals;
      if (
        (this.vitals_shift_timer > this.vitals_shift_window) &
        this.realtime
      ) {
        this.vitals.shift();
        this.vitals.splice(0, 1, this.header_vitals);
      }
      this.vitals.push(this.data_vitals_object);

      // reset the datalogger timer
      this.datalogger_timer_vitals = 0;
    }

    // increase the datalogger timer with the modeling_stepsize
    this.datalogger_timer_custom += this.model.modeling_stepsize;

    // increase the datalogger vitals timer with the modeling_stepsize
    this.datalogger_timer_vitals += this.model.modeling_stepsize;
  }
}
