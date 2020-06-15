export class ModelInterface {
  constructor(_filename) {
    // declare an instance of the model engine
    this.modelEngine = new Worker("statics/ExplainEngine/engine_main.js");

    // declare a dataloggers object which holds all loaded dataloggers
    this.loggers = {};

    // declare a interventions object which holds all loaded interventions
    this.interventions = {};

    // attach a unique identifier to this model instance
    this.ID = _filename;

    // send the ID to the model engine
    this.sendMessageToModelEngine({
      type: "cmd",
      subtype: "set_id",
      target: null,
      data: this.ID
    });

    // declare a handler to received messages from the model engine instance
    this.modelEngine.onmessage = event => {
      this.modelEngineMessageHandler(event);
    };

    // declare a handler to receive error messages from the model engine instance
    this.modelEngine.onerror = event => {
      this.modelEngineErrorHandler(event);
    };

    // load data from the modeldefinition file into the model engine instance
    this.injectModelDefinitionIntoModelEngine(_filename);
  }

  sendMessageToModelEngine(_message) {
    // send a message to the model engine instance
    if (this.modelEngine) {
      this.modelEngine.postMessage(_message);
    }
  }

  setLogger(_config) {
    this.sendMessageToModelEngine({
      type: "set",
      subtype: "config_datalogger",
      target: null,
      data: _config
    });
  }

  setLoggerVitals(_config) {
    this.sendMessageToModelEngine({
      type: "set",
      subtype: "config_datalogger_vitals",
      target: null,
      data: _config
    });
  }

  setIntervention(_config) {
    // first clear the last interventions
    this.emptyInterventions();

    // set the new interventions
    this.sendMessageToModelEngine({
      type: "set",
      subtype: "set_interventions",
      target: null,
      data: _config
    });
  }

  emptyInterventions() {
    this.sendMessageToModelEngine({
      type: "cmd",
      subtype: "empty_interventions",
      target: null,
      data: null
    });
  }

  calculateModel(_period) {
    // calculate <_period> seconds of the model engine instance
    if (this.modelEngine) {
      this.sendMessageToModelEngine({
        type: "cmd",
        subtype: "calculate",
        target: null,
        data: _period
      });
    }
  }

  startModel(_datawindow = 5, _update_interval = 0.05) {
    // start the realtime mode of the model engine instance
    if (this.modelEngine) {
      this.sendMessageToModelEngine({
        type: "cmd",
        subtype: "start",
        target: null,
        data: [_datawindow, _update_interval]
      });
    }
  }

  stopModel() {
    // stop the realtime mode of the model engine instance
    if (this.modelEngine) {
      this.sendMessageToModelEngine({
        type: "cmd",
        subtype: "stop",
        target: null,
        data: null
      });
    }
  }

  modelEngineMessageHandler(e) {
    // handle the messages coming from the model engine instance
    switch (e.data.type) {
      case "mes":
        // process the model message in the modelStore
        console.log(
          `%cENGINE: ${e.data.data[0]}`,
          "color:red; font-style:italic"
        );
        break;
    }
  }

  modelEngineErrorHandler(e) {
    // handle the messages coming from the model engine instance
    return false;
  }

  injectModelDefinitionIntoModelEngine(json_filename) {
    // inject a model definition json file into the model engine instance
    this.xobj = new XMLHttpRequest();
    this.xobj.overrideMimeType("application/json");
    this.xobj.open("GET", json_filename, true);
    this.xobj.onreadystatechange = () => {
      if (this.xobj.readyState == 4 && this.xobj.status == "200") {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        // load the model
        if (this.modelEngine) {
          this.sendMessageToModelEngine({
            type: "cmd",
            subtype: "load",
            data: this.xobj.responseText
          });
        }
      }
    };
    this.xobj.send(null);
  }

  injectLoggerDefinitions(logger_definitions) {
    let loggerDefinitions = JSON.parse(logger_definitions);
    Object.keys(loggerDefinitions).forEach(logger => {
      this.loggers[logger] = loggerDefinitions[logger];
    });
  }

  injectInterventions(intervention_definitions) {
    let interventionsDefinitions = JSON.parse(intervention_definitions);
    Object.keys(interventionsDefinitions).forEach(intervention => {
      this.interventions[intervention] = interventionsDefinitions[intervention];
    });
  }

  importLoggers(model, json_filename) {
    // load logger definitions
    // inject a model definition json file into the model engine instance

    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", json_filename, true);
    xobj.onreadystatechange = () => {
      if (xobj.readyState == 4 && xobj.status == "200") {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        // load the model
        model.injectLoggerDefinitions(xobj.responseText);
        // set the default datalogger
        model.setLogger(model.loggers.default);
        // set the vitals datalogger
        model.setLoggerVitals(model.loggers.vitals);
      }
    };
    xobj.send(null);
  }

  importInterventions(model, json_filename) {
    // load logger definitions
    // inject a model definition json file into the model engine instance
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", json_filename, true);
    xobj.onreadystatechange = () => {
      if (xobj.readyState == 4 && xobj.status == "200") {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        // load the model
        model.injectInterventions(xobj.responseText);
      }
    };
    xobj.send(null);
  }
}
