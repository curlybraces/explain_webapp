class Ventilator {
  constructor(_model) {
    this.model = _model;

    // declare the instance variables
    this.inspiration = true;
    this.expiration = false;

    this.insp_pressure_reached = false;
    this.exp_pressure_reached = false;

    this.insp_counter = 0;
    this.exp_counter = 0;

    this.measured_freq = 0;
    this.measured_freq_counter = 0;
    this.volume = 0;
    this.flow = 0;
    this.pressure = 0;
    this.peak_pressure = 0;
    this.peak_pressure_found = false;
    this.plateau_pressure = 0;
    this.peak_pressure_before_hold = 0;
    this.exhaled_tidal_volume = 0;
    this.exhaled_tidal_volume_counter = 0;
    this.compliance_static = 0;
    this.resistance_airway = 0;
    this.time_constant = 0;
    this.minute_volume = 0;
    this.volume_garanteed = true;

    this.found_resistance = 4000;
    this.prev_flow = 0;
    this.trigger_counter = 0;
  }

  modelStep() {
    if (this.is_enabled) {
      this.modelCycle();
    }
  }

  pressureControl(p_atm) {
    if (this.TUBINGIN.pres_current >= this.pip + p_atm) {
      // calculate how much volume needs to be removed to keep the pressure
      let delta_p = this.TUBINGIN.pres_current - (this.pip + p_atm); // in mmHg
      let volumeout =
        delta_p /
        (this.TUBINGIN.el_baseline * this.TUBINGIN.el_baseline_factor);
      this.TUBINGIN.gasOut(volumeout);
    }
  }

  volumeGarantee(p_atm) {
    if (
      this.exhaled_tidal_volume >
      this.target_tidal_volume + this.target_tidal_volume * 0.05
    ) {
      // decreased the max_pip
      this.pip -= 0.74;
      if (this.pip < this.peep + 2.7) {
        this.pip = this.peep + 2.7;
      }
    }
    if (
      this.exhaled_tidal_volume <
      this.target_tidal_volume - this.target_tidal_volume * 0.05
    ) {
      // decreased the max_pip
      this.pip += 0.74;
      if (this.pip > this.max_pip) {
        this.pip = this.max_pip;
      }
    }
  }

  volumeControl(p_atm) {
    // calculate the desired flow which together with the inspiration time determines to tidal volume
    let desired_flow = this.target_tidal_volume / this.t_in; // in l per sec
    // real_flow in in l/sec

    if (this.VENTIN_TUBINGIN.real_flow < desired_flow) {
      // desired flow => TV 15 ml => 0.015 l in 0.4 sec = 0.0375 l per sec = 2,25 l/min
      this.VENTIN_TUBINGIN.res_forward_baseline -= 1;
      this.VENTIN_TUBINGIN.res_backward_baseline -= 1;
      if (this.VENTIN_TUBINGIN.res_forward_baseline < 20) {
        this.VENTIN_TUBINGIN.res_forward_baseline = 20;
        this.VENTIN_TUBINGIN.res_backward_baseline = 20;
      }
    }
    if (this.YPIECE_NCA.real_flow > desired_flow) {
      // desired flow => TV 15 ml => 0.015 l in 0.4 sec = 0.0375 l per sec = 2,25 l/min
      this.VENTIN_TUBINGIN.res_forward_baseline += 1;
      this.VENTIN_TUBINGIN.res_backward_baseline += 1;
      if (this.VENTIN_TUBINGIN.res_forward_baseline > 2000) {
        this.VENTIN_TUBINGIN.res_forward_baseline = 2000;
        this.VENTIN_TUBINGIN.res_backward_baseline = 2000;
      }
    }

    this.found_resistance = this.VENTIN_TUBINGIN.res_forward_baseline;
  }

  flowControl(p_atm) {}

  setPEEP() {
    if (this.peep != undefined) {
      this.VENTOUT.vol_current =
        this.VENTOUT.vol_unstressed_baseline +
        this.peep /
          (this.VENTOUT.el_baseline * this.VENTOUT.el_baseline_factor);
    }
  }

  detectTrigger(p_atm, t) {
    // triggering not yet implemented
  }

  modelCycle() {
    // reference the model parts for performance reasons
    this.VENTIN = _model.components["VENTIN"];
    this.TUBINGIN = _model.components["TUBINGIN"];
    this.YPIECE = _model.components["YPIECE"];
    this.TUBINGOUT = _model.components["TUBINGOUT"];
    this.VENTOUT = _model.components["VENTOUT"];

    this.VENTIN_TUBINGIN = _model.components["VENTIN_TUBINGIN"];
    this.TUBINGIN_YPIECE = _model.components["TUBINGIN_YPIECE"];
    this.YPIECE_NCA = _model.components["YPIECE_NCA"];
    this.YPIECE_TUBINGOUT = _model.components["YPIECE_TUBINGOUT"];
    this.TUBINGOUT_VENTOUT = _model.components["TUBINGOUT_VENTOUT"];

    // get the modeling stepsize
    let t = this.model.modeling_stepsize;

    // get the atmospheric pressure
    let p_atm = this.model.models["metabolism"].p_atm;

    // check whether there's an inspiration
    if (this.inspiration) {
      // close the expiratory valve
      this.TUBINGOUT_VENTOUT.res_forward_baseline = 1000000000;
      this.TUBINGOUT_VENTOUT.res_backward_baseline = 100000000;

      // open the inspiratory valve
      this.VENTIN_TUBINGIN.res_forward_baseline = 1400;
      this.VENTIN_TUBINGIN.res_backward_baseline = 1400;

      // check the ventilator mode
      switch (this.ventilator_mode) {
        case "pressure":
          this.pressureControl(p_atm);
          break;
        case "volume":
          this.VENTIN_TUBINGIN.res_forward_baseline = this.found_resistance;
          this.VENTIN_TUBINGIN.res_backward_baseline = this.found_resistance;
          this.volumeControl(p_atm);
          break;
        case "flow":
          this.flowControl(p_atm);
          break;
      }

      // is the inspiratory hold function active?
      if (this.insp_hold) {
        // is it time to do an inspiratory hold?
        if (this.insp_counter > this.t_in - this.t_in_hold) {
          if (!this.peak_pressure_found) {
            // determine the peak pressure just before shutting down the inspiration valve
            this.peak_pressure = (this.YPIECE.pres_current - p_atm) * 1.35951;
            this.peak_pressure_found = true;
          }
          // close the inspiration valve
          this.VENTIN_TUBINGIN.res_forward_baseline = 1000000000;
          this.VENTIN_TUBINGIN.res_backward_baseline = 100000000;
        }
      }

      // increase the inspiration timer
      this.insp_counter += t;
    }

    if (this.expiration) {
      // close the inspiratory valve
      this.VENTIN_TUBINGIN.res_forward_baseline = 1000000000;
      this.VENTIN_TUBINGIN.res_backward_baseline = 100000000;

      // open the expiratory valve
      this.TUBINGOUT_VENTOUT.res_forward_baseline = 10;
      this.TUBINGOUT_VENTOUT.res_backward_baseline = 10;

      // increase the exhaled tidal volume
      this.exhaled_tidal_volume_counter += this.YPIECE_TUBINGOUT.real_flow * t;

      // increase the expiration timer
      this.exp_counter += t;
    }

    // determine the characteristics
    this.pressure = (this.YPIECE.pres_current - p_atm) * 1.35951;
    this.flow = this.YPIECE_NCA.real_flow;
    this.volume += this.YPIECE_NCA.real_flow * t;

    // frequency counter
    this.measured_freq_counter += t;

    // detect trigger
    this.detectTrigger(p_atm, t);

    // determine the ventilator cycling
    this.ventilatorCycling(p_atm);
  }

  beginInspiration(p_atm) {
    this.measured_freq = 60 / this.measured_freq_counter;
    this.measured_freq_counter = 0;
    this.minute_volume = this.measured_freq * this.exhaled_tidal_volume;
    // inspiration start
    if (this.volume_garanteed) {
      this.volumeGarantee(p_atm);
    }
    this.insp_pressure_reached = false;
    this.exp_counter = 0;
    this.expiration = false;
    this.inspiration = true;
    this.trigger_counter = 0;
  }
  ventilatorCycling(p_atm) {
    if (this.cycling_mode === "time") {
      // cycling for inspiration to expiration is based on time settings of t_in and t_ex
      if (this.insp_counter > this.t_in) {
        // expiration starts
        this.setPEEP();
        this.insp_counter = 0;
        this.inspiration = false;
        this.expiration = true;
        this.peak_pressure_found = false;
        this.exhaled_tidal_volume = this.exhaled_tidal_volume_counter;
        this.exhaled_tidal_volume_counter = 0;

        // do the calculations
        this.plateau_pressure = (this.YPIECE.pres_current - p_atm) * 1.35951;
        this.compliance_static =
          this.exhaled_tidal_volume *
          (this.plateau_pressure - this.peep * 1.35951);
        this.resistance_airway =
          (this.peak_pressure - this.plateau_pressure) / this.flow;
        this.time_constant = this.compliance_static * this.resistance_airway;
      }

      if (this.exp_counter > this.t_ex) {
        this.beginInspiration(p_atm);
      }
    }
  }
}
