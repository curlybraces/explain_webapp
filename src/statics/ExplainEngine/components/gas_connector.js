class GasConnector {
  constructor(_model) {
    this.model = {};

    this.comp1 = null;
    this.comp2 = null;

    this.res_current = 0;
    this.in_current = 0;
    this.current_flow = 0;
    this.real_flow = 0;
    this.no_flow = false;

    this.model = _model;

    this.flow_cummulator = 0;
    this.flow_counter = 0;
    this.average_flow = 0;
  }

  calcInductance() {
    return this.in_baseline * this.in_baseline_factor;
  }

  calcResistance() {
    let no_flow_factor = 1;
    if (this.no_flow) {
      no_flow_factor = 1000000;
    }

    if (this.comp1.pres_current > this.comp2.pres_current) {
      return (
        this.res_forward_baseline *
        this.res_forward_baseline_factor *
        no_flow_factor
      );
    } else {
      return (
        this.res_backward_baseline *
        this.res_backward_baseline_factor *
        no_flow_factor
      );
    }
  }

  analyzeFlow() {
    // reset every 5 seconds
    if (this.flow_counter > 100000) {
      this.flow_cummulator = (this.average_flow / 60) * 50000;
      this.flow_counter = 50000;
    }

    this.flow_cummulator += this.real_flow;
    this.flow_counter += 1;
    this.average_flow = (this.flow_cummulator / this.flow_counter) * 60;
  }

  modelStep() {
    if (this.is_enabled) {
      // find a reference to the compartments which are connected by this connector
      this.comp1 = this.model.components[this.comp_from];
      this.comp2 = this.model.components[this.comp_to];

      // calculate the current resistance
      this.res_current = this.calcResistance();

      // calculate the current inductance
      this.in_current = this.calcInductance();

      // calculate the flow

      // find the flow direction
      if (this.comp1.pres_current > this.comp2.pres_current) {
        // calculate the flow
        this.current_flow =
          (this.comp1.pres_current - this.comp2.pres_current) /
          this.res_current;
        // remove blood from comp1
        this.comp1.gasOut(this.current_flow * this.model["modeling_stepsize"]);
        // add blood to comp2
        this.comp2.gasIn(
          this.current_flow * this.model["modeling_stepsize"],
          this.comp1
        );
        // store the flow
        this.real_flow = this.current_flow;
      } else {
        // if no backflow is set then set the flow to zero
        if (this.no_backflow) {
          this.current_flow = 0;
          this.real_flow = 0;
        } else {
          // calculate the flow
          this.current_flow =
            (this.comp2.pres_current - this.comp1.pres_current) /
            this.res_current;
          // add blood to comp1
          this.comp1.gasIn(
            this.current_flow * this.model["modeling_stepsize"],
            this.comp2
          );
          // remove blood from comp2
          this.comp2.gasOut(
            this.current_flow * this.model["modeling_stepsize"]
          );
          // store the real flow
          this.real_flow = -this.current_flow;
        }
      }
      this.analyzeFlow();
    }
  }
}
