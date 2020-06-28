// This is a Worker instance for the physiological model engine
// It runs in a separate thread for performance reasons and has no access to the DOM nor the window object

// The scope is defined by self

// import all the required model components and submodels

self.importScripts("./models/ecg.js");
self.importScripts("./models/heart.js");
self.importScripts("./models/ans.js");
self.importScripts("./models/breathing.js");
self.importScripts("./models/ventilator.js");
self.importScripts("./models/avinteraction.js");
self.importScripts("./models/birth.js");
self.importScripts("./models/brain.js");
self.importScripts("./models/drugs.js");
self.importScripts("./models/kidneys.js");
self.importScripts("./models/liver.js");
self.importScripts("./models/ecmo.js");
self.importScripts("./models/placenta.js");
self.importScripts("./models/acidbase.js");
self.importScripts("./models/oxygenation.js");
self.importScripts("./models/metabolism.js");
self.importScripts("./components/blood_compartment.js");
self.importScripts("./components/blood_connector.js");
self.importScripts("./components/gas_compartment.js");
self.importScripts("./components/gas_connector.js");
self.importScripts("./components/exchanger.js");
self.importScripts("./components/container.js");
self.importScripts("./components/diffusor.js");
self.importScripts("./components/shunt.js");
self.importScripts("./components/valve.js");
self.importScripts("./helpers/brent_root_finding.js");
self.importScripts("./engine_datalogger.js");
self.importScripts("./engine_interventions.js");

// unique ID for this model
let ID = "";
// define an object which is going to hold the entire model
let current_model = {};
// set the model total running time
current_model["model_time_total"] = 0;
// set the modelrun time
current_model["model_time_run"] = 0;
// define an object which is going to take care of the interventions
let engine_interventions = {};
// define an object which is going to hold the data annotations
let annotations = [];

// define some state variables for the model cycle timings
let t;
let main_timer;
let measured_model_interval;
let model_performance = 0;

// attach an event handler to receive messages from the UI thread.
onmessage = function(e) {
  switch (e.data.type) {
    case "cmd":
      if (e.data.subtype === "set_id") {
        ID = e.data.data;
      }
      if (e.data.subtype === "load") {
        loadModel(e.data["data"]);
      }
      if (e.data.subtype === "start") {
        startModel(e.data.data);
      }
      if (e.data.subtype === "stop") {
        stopModel();
      }
      if (e.data.subtype === "calculate") {
        if (e.data.data === null) {
          // if no duration is supplied calculate 10 seconds
          calculateModel(10);
        } else {
          // calculate a number of seconds of the model
          calculateModel(e.data.data);
        }
      }
      break;

    case "set":
      if (e.data.subtype === "set_interventions") {
        engine_interventions.setInterventions(e.data.data);
      }
      if (e.data.subtype === "model_settings") {
        Object.keys(e.data.data).forEach(setting => {
          current_model.models[e.data.target][setting] = e.data.data[setting];
        });
      }
      if (e.data.subtype === "component_settings") {
        Object.keys(e.data.data).forEach(setting => {
          current_model.components[e.data.target][setting] =
            e.data.data[setting];
        });
      }
      break;

    case "get":
      if (e.data.subtype === "model_state") {
        SendMessage(
          "model_state",
          null,
          null,
          this.engine_datalogger.getModelStateVerbose(0, "")
        );
      }
      if (e.data.subtype === "component_props") {
        SendMessage(
          "component_props",
          null,
          null,
          this.engine_datalogger.getModelStateVerbose(0, "")
        );
      }

      if (e.data.subtype === "components") {
        SendMessage(
          "components",
          null,
          null,
          this.engine_datalogger.getModelStateVerbose(0, "")
        );
      }
      if (e.data.subtype === "model_props") {
        SendMessage(
          "model_props",
          null,
          null,
          this.engine_datalogger.getModelStateVerbose(0, "")
        );
      }
      break;

    default:
      this.console.log(
        "model received unknown command ",
        e.data.type,
        e.data.subtype,
        e.data.target,
        e.data.data
      );
      break;
  }
};

// routine to send messages to the UI thread
const SendMessage = function(type_mes, subtype_mes, target_mes, data_mes) {
  postMessage({
    id: ID,
    type: type_mes,
    subtype: subtype_mes,
    target: target_mes,
    data: data_mes
  });
};

// initialized the model from the model_definition file
const initModel = function(model_definition) {
  if (model_definition) {
    current_model["weight"] = model_definition["weight"];
    current_model["name"] = model_definition["name"];
    current_model["modeling_interval"] = model_definition["modeling_interval"];
    current_model["modeling_stepsize"] = model_definition["modeling_stepsize"];

    // define the dictionary holding all model components in the current model instance
    current_model["components"] = {};
    current_model["models"] = {};

    // inject the acidbase and oxygenation models
    current_model["acidbase"] = calcAcidbaseFromTCO2;
    current_model["oxygenation"] = calcOxygenationFromTO2;

    // initialize all the components
    model_definition.blood_compartment_definitions.forEach(element => {
      let newComp = new BloodCompartment(current_model);
      Object.keys(element).forEach(function(key) {
        newComp[key] = element[key];
      });
      current_model.components[newComp.name] = newComp;
    });

    model_definition.blood_connector_definitions.forEach(element => {
      let newComp = new BloodConnector(current_model);
      Object.keys(element).forEach(function(key) {
        newComp[key] = element[key];
      });
      current_model.components[newComp.name] = newComp;
    });

    model_definition.valve_definitions.forEach(element => {
      let newComp = new Valve(current_model);
      Object.keys(element).forEach(function(key) {
        newComp[key] = element[key];
      });
      current_model.components[newComp.name] = newComp;
    });

    model_definition.shunt_definitions.forEach(element => {
      let newComp = new Shunt(current_model);
      Object.keys(element).forEach(function(key) {
        newComp[key] = element[key];
      });
      current_model.components[newComp.name] = newComp;
    });

    model_definition.gas_compartment_definitions.forEach(element => {
      let newComp = new GasCompartment(current_model);
      Object.keys(element).forEach(function(key) {
        newComp[key] = element[key];
      });
      current_model.components[newComp.name] = newComp;
    });

    model_definition.gas_connector_definitions.forEach(element => {
      let newComp = new GasConnector(current_model);
      Object.keys(element).forEach(function(key) {
        newComp[key] = element[key];
      });
      current_model.components[newComp.name] = newComp;
    });

    model_definition.container_definitions.forEach(element => {
      let newComp = new Container(current_model);
      Object.keys(element).forEach(function(key) {
        newComp[key] = element[key];
        newComp["found_compartments"] = false;
      });
      current_model.components[newComp.name] = newComp;
    });

    model_definition.diffusor_definitions.forEach(element => {
      let newComp = new Diffusor(current_model);
      Object.keys(element).forEach(function(key) {
        newComp[key] = element[key];
        newComp["found_compartments"] = false;
      });
      current_model.components[newComp.name] = newComp;
    });

    model_definition.exchanger_definitions.forEach(element => {
      let newComp = new Exchanger(current_model);
      Object.keys(element).forEach(function(key) {
        newComp[key] = element[key];
        newComp["found_compartments"] = false;
      });
      current_model.components[newComp.name] = newComp;
    });

    // initialize all the models with the parameters from the JSON file
    current_model.models["metabolism"] = new Metabolism(current_model);
    Object.keys(model_definition.metabolism).forEach(function(key) {
      current_model.models.metabolism[key] = model_definition.metabolism[key];
    });

    current_model.models["ecg"] = new ECG(current_model);
    Object.keys(model_definition.ecg).forEach(function(key) {
      current_model.models.ecg[key] = model_definition.ecg[key];
    });

    current_model.models["heart"] = new Heart(current_model);
    Object.keys(model_definition.heart).forEach(function(key) {
      current_model.models.heart[key] = model_definition.heart[key];
    });

    current_model.models["breathing"] = new Breathing(current_model);
    Object.keys(model_definition.breathing).forEach(function(key) {
      current_model.models.breathing[key] = model_definition.breathing[key];
    });

    current_model.models["ventilator"] = new Ventilator(current_model);
    Object.keys(model_definition.ventilator).forEach(function(key) {
      current_model.models.ventilator[key] = model_definition.ventilator[key];
    });

    current_model.models["ans"] = new ANS(current_model);
    Object.keys(model_definition.ans).forEach(function(key) {
      current_model.models.ans[key] = model_definition.ans[key];
    });

    current_model.models["avinteraction"] = new AvInteraction(current_model);
    Object.keys(model_definition.avinteraction).forEach(function(key) {
      current_model.models.avinteraction[key] =
        model_definition.avinteraction[key];
    });

    current_model.models["brain"] = new Brain(current_model);
    Object.keys(model_definition.brain).forEach(function(key) {
      current_model.models.brain[key] = model_definition.brain[key];
    });

    current_model.models["drugs"] = new Drugs(current_model);
    Object.keys(model_definition.drugs).forEach(function(key) {
      current_model.models.drugs[key] = model_definition.drugs[key];
    });

    current_model.models["kidneys"] = new Kidneys(current_model);
    Object.keys(model_definition.kidneys).forEach(function(key) {
      current_model.models.kidneys[key] = model_definition.kidneys[key];
    });

    current_model.models["liver"] = new Liver(current_model);
    Object.keys(model_definition.liver).forEach(function(key) {
      current_model.models.liver[key] = model_definition.liver[key];
    });

    current_model.models["placenta"] = new Placenta(current_model);
    Object.keys(model_definition.placenta).forEach(function(key) {
      current_model.models.placenta[key] = model_definition.placenta[key];
    });

    current_model.models["birth"] = new Birth(current_model);
    Object.keys(model_definition.birth).forEach(function(key) {
      current_model.models.birth[key] = model_definition.birth[key];
    });

    current_model.models["ecmo"] = new ECMO(current_model);
    Object.keys(model_definition.ecmo).forEach(function(key) {
      current_model.models.ecmo[key] = model_definition.ecmo[key];
    });

    // initialize the datalogger
    engine_datalogger = new Datalogger(current_model);

    // initialize the interventions engine
    engine_interventions = new Interventions(current_model);

    // post a message that the model is initialized
    SendMessage("mes", null, null, ["model engine initialized"]);
  }
};

// calculate a number of seconds of the model
const calculateModel = function(time_to_calculate) {
  // calculate the number of steps needed for this
  let no_needed_steps = parseInt(
    time_to_calculate / current_model.modeling_interval
  );

  // send starting message for this model run
  SendMessage("mes", null, null, [
    `current model clock at ${Math.round(
      current_model.model_time_total
    )} seconds.`
  ]);
  SendMessage("mes", null, null, [
    `calculating for ${time_to_calculate} seconds in ${no_needed_steps} steps.`
  ]);

  // reset the model_time_run
  current_model["model_time_run"] = 0;
  let total_step_execution_time = 0;
  let cum_step_execution_time = 0;
  let run_start_time = current_model.model_time_total;
  if (model_definition) {
    for (step = 0; step < no_needed_steps; step++) {
      // increase the model run time
      current_model.model_time_run += current_model.modeling_interval;
      // do the model step
      modelStep();
      total_step_execution_time += model_performance;
    }

    // calculate the performance metrics
    let average_model_step_time =
      (total_step_execution_time / no_needed_steps) * 1000;

    SendMessage("mes", null, null, [
      `calculations ready in ${total_step_execution_time.toFixed(3)} seconds.`
    ]);
    SendMessage("mes", null, null, [
      `average model step in ${average_model_step_time.toFixed(
        6
      )} milliseconds.`
    ]);
  }
};

// start the realtime mode
const startModel = function(params) {
  if (model_definition) {
    // reset the main timer if it's already running
    if (main_timer) {
      clearInterval(main_timer);
    }
    // store the current time
    t = performance.now();

    // set the main timer to the modeling interval which is stored in the JSON model definition
    main_timer = setInterval(
      modelStep,
      model_definition["modeling_interval"] * 1000
    );

    // notify main that the model is started
    SendMessage("mes", null, null, ["model started"]);
  } else {
    SendMessage("mes", null, null, [
      "failed to start model. model not initialized!"
    ]);
  }
};

// stop the realtime window
const stopModel = function() {
  if (model_definition) {
    // stop the main timer
    if (main_timer) {
      clearInterval(main_timer);
    }
    // notify UI that the model is stopped
    SendMessage("mes", null, null, ["model stopped"]);
  } else {
    SendMessage("mes", null, null, [
      "failed to start model. model not initialized!"
    ]);
  }
};

const disposeModel = function() {
  // stop the main timer
  if (main_timer) {
    clearInterval(main_timer);
  }

  // erase the current model object
  current_model = {};

  SendMessage("mes", null, null, ["model disposed"]);
};

const loadModel = function(json_model_definition) {
  // parse the JSON file into the model_definition object
  model_definition = JSON.parse(json_model_definition);

  // notify that the model is loaded
  SendMessage("mes", null, null, ["model engine loaded"]);

  // initialize the model with the just loaded model definition
  initModel(model_definition);
};

// model cycle loop which is called every x ms defined by the modeling stepsize in the model definition
const modelStep = function() {
  // get the current accurate time in ms
  let w = performance.now();

  // model performance calculation
  let t0 = performance.now();

  // measure the actual interval as Javascript isn't reliable in the timers
  measured_model_interval = (w - t) / 1000;

  // store the current time in the t variable
  t = w;

  // execute the new model cycle
  // calculate the number of frames used for the models using even smaller stepsizes
  let no_frames = Math.round(
    current_model["modeling_interval"] / current_model["modeling_stepsize"]
  );

  // model cycles with smaller stepsize for higher resolution results
  for (let i = 0; i < no_frames; i++) {
    // iterate over all models and do the modelstep
    for (const key in current_model.models) {
      current_model.models[key].modelStep();
    }

    // iterate over all components and do the modelstep
    for (const key in current_model.components) {
      current_model.components[key].modelStep();
    }

    // update the datalogger
    engine_datalogger.modelStep(
      current_model.model_time_total,
      engine_interventions.getAnnotations()
    );

    if (engine_datalogger.annotations_processed) {
      engine_datalogger.annotations_processed = false;
      engine_interventions.clearAnnotations();
    }

    // increase the current modeltime
    current_model.model_time_total += current_model.modeling_stepsize;
  }

  // update the intervention engine
  engine_interventions.modelStep(current_model.model_time_total);

  // calculate the model performance -> meaning how long did this model step take
  model_performance = (performance.now() - t0) / 1000;
};
