class Datalogger {
  constructor(_model) {
    // declare a reference to the global model which is injected in this class
    this.model = _model;
    this.datalogger_timer = 0;
    this.datalogger_timer_interval = this.model.modeling_interval;
    this.annotations_processed = false;

    this.model_states = [];
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

  getModelStateVerbose(_current_model_time, annotation = "") {
    // a complete snapshot of the model and components is made here at time <_current_model_time>
    // this step seems like a performance hit but actually takes 0.61 ms! so this does no harm :)
    // long live the speed of JS

    // define a model state dictionary
    let model_state = {};

    // first entry is the time
    model_state["time"] = _current_model_time;
    model_state["annotation"] = annotation;
    model_state["interval"] = this.model.modeling_interval;
    model_state["stepsize"] = this.model.modeling_stepsize;

    // iterate over all components
    Object.keys(this.model.components).forEach(key => {
      // shallow copy the component
      let newObj = Object.assign({}, this.model.components[key]);

      // delete the associated referenced model (creates a circular copy) and other objects
      delete newObj.model;
      delete newObj.comp1;
      delete newObj.comp2;
      delete newObj.temp_volumes;
      delete newObj.temp_pressures;

      // store the copy into the model_state
      model_state[newObj.name] = newObj;
    });

    Object.keys(this.model.models).forEach(key => {
      // shallow copy the model
      let newObj = Object.assign({}, this.model.models[key]);

      // delete the associated referenced model (creates a circular copy)
      delete newObj.model;

      // store the copy into the model_state
      model_state[newObj.name] = newObj;
    });

    return model_state;
  }
  modelStep(_current_model_time, annotations) {
    // has the datalogger time interval elapsed? then get a model snapshot
    if (this.datalogger_timer >= this.datalogger_timer_interval) {
      this.datalogger_timer = 0;

      // send the model stte
      SendMessage(
        "state",
        null,
        null,
        this.getModelStateVerbose(_current_model_time, annotations)
      );

      // signal that the annotations have been processed
      this.annotations_processed = true;
    }
    // increase the datalogger timer with the modeling_stepsize
    this.datalogger_timer += this.model.modeling_stepsize;
  }
}
