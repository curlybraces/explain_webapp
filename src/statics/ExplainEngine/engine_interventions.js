class Interventions {
    constructor(_model) {
        // declare a reference to the global model which is injected in this class
        this.model = _model;

        // declare a list which containes all current interventions
        this.interventions = []

        // declare an annotations object to display the interventions in the datalogger
        this.annotations = {}

        // current model time
        this.current_model_time = 0

    }

    SendMessage = function(type_mes, subtype_mes, target_mes, data_mes) {
        postMessage({
          id: ID,
          type: type_mes,
          subtype: subtype_mes,
          target: target_mes,
          data: data_mes
        })
    }

    clearAnnotations() {
        this.annotations = {}
    }
    getAnnotations() {
        return this.annotations
    }

    setInterventions(_config) {
        this.interventions = _config

        // set all times relative to current time
        this.interventions.forEach( intervention => {
           intervention.at_time = intervention.at_time + this.current_model_time 
        })    

    }

    clearInterventions() {
        this.interventions = []
    }


    modelStep(_current_model_time) {
        // store the model time
        this.current_model_time = _current_model_time
        
        // iterate over all interventions 
        this.interventions.forEach( intervention => {
            this.processIntervention(intervention, _current_model_time)
        })      

    }

    processIntervention(intervention, _current_model_time) {
        
        // check whether it is time to start this intervention
        if (_current_model_time >= intervention['at_time'] & !intervention['started']) {
            intervention['started'] = true

            // figure out the type of intervention (parameter change or switch a boolean)
            if (intervention.property_type === 'boolean') {
                if (intervention.type === 'component') {
                    this.model.components[intervention.name][intervention.property] = intervention.target
                    intervention.completed = true
                    this.annotations['text'] = 'start ' + intervention.label
                }
                if (intervention.type === 'model') {
                    this.model.models[intervention.name][intervention.property] = intervention.target
                    intervention.completed = true
                    this.annotations['text'] = 'start ' + intervention.label
                }
            } else {
                // calculate the stepsize for this intervention
                if (intervention.type === 'component') {
                    intervention['stepsize'] = (intervention.target - this.model.components[intervention.name][intervention.property]) / intervention.in_time * this.model.modeling_interval
                    this.SendMessage('mes',null,null, [`start intervention on ${intervention.name} - ${intervention.property} at ${Math.round(_current_model_time)} sec.`])
                    this.annotations['text'] = 'start ' + intervention.label
                }

                if (intervention.type === 'model') {
                    intervention['stepsize'] = (intervention.target - this.model.models[intervention.name][intervention.property]) / intervention.in_time * this.model.modeling_interval
                    this.SendMessage('mes',null,null, [`start intervention on ${intervention.name} - ${intervention.property} at ${Math.round(_current_model_time)} sec.`])
                    this.annotations['text'] = 'start ' + intervention.label
                }
            }
        }

        // apply the intervention
        if (intervention.started & !intervention.completed) {   
            
            if (intervention.type === 'component') {
                this.model.components[intervention.name][intervention.property] += intervention.stepsize 
                if (Math.abs(this.model.components[intervention.name][intervention.property] - intervention.target) < Math.abs(intervention.stepsize)){
                    intervention.completed = true
                    this.SendMessage('mes',null,null, [`finished intervention on ${intervention.name} - ${intervention.property} at ${Math.round(_current_model_time)} sec.`])
                    this.annotations['text'] = 'end ' + intervention.label
                }
            }

            if (intervention.type === 'model') {
                this.model.models[intervention.name][intervention.property] += intervention.stepsize 
                if (Math.abs(this.model.models[intervention.name][intervention.property] - intervention.target) < Math.abs(intervention.stepsize)){
                    intervention.completed = true
                    this.SendMessage('mes',null,null, [`finished intervention on ${intervention.name} - ${intervention.property} at ${Math.round(_current_model_time)} sec.`])
                    this.annotations['text'] = 'end ' + intervention.label
                }
            }
        }


    }

}