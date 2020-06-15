class Breathing {
  constructor(_model) {
    this.model = _model;

    this.amp = 8.0;
    this.tidal_volume = 0;
    this.minute_volume = 0;

    this.temp_min_volume = 10000;
    this.temp_max_volume = -10000;

    this.volume_time_counter = 0;

    this.breath_timer_period = 0;
    this.breath_timer_counter = 0;

    this.measured_spont_updater_counter = 0

    this.measured_spont_breath_counter = 0
    this.measured_spont_breath_freq = 0

  }

  calculateVolumes() {
    // calculate the tidal and minute volumes
    this.tidal_volume = this.temp_max_volume - this.temp_min_volume;
    this.minute_volume = this.tidal_volume * this.spont_resp_rate;

    // max and mins
    this.temp_min_volume = 10000;
    this.temp_max_volume = -10000;

    // reset the volumes counter
    this.volume_time_counter = 0;
  }

  generateMuscleSignal() {
    return (
      -this.amp *
      Math.exp(
        -25 *
          (Math.pow(this.breath_timer_counter - this.breath_duration / 2, 2) /
            Math.pow(this.breath_duration, 2))
      )
    );
  }
  
  vtrrController() {
    // calculate the spontaneous resp rate depending on the target minute volume (from ANS) and the set vt-rr ratio
    this.spont_resp_rate = Math.sqrt(
      this.target_minute_volume / this.vtrr_ratio
    );

    // calculate the target tidal volume depending on the target resp rate and target minute volume (from ANS)
    this.target_tidal_volume = this.target_minute_volume / this.spont_resp_rate;
  }

  startBreath() {
    // calculate the current tidal and minute volume
    this.calculateVolumes();

    // has the target tidal volume been reached or exceeded?
    let d_tv = this.tidal_volume - this.target_tidal_volume;

    // adjust the respiratory power to the resp muscles
    if (d_tv < -0.0001) {
      this.amp -= 0.1 * d_tv * 1000;
      if (this.amp > this.max_amp) {
        this.amp = this.max_amp;
      }
    }

    if (d_tv > 0.0001) {
      this.amp -= 0.1 * d_tv * 1000;
      if (this.amp < 0) {
        this.amp = 0;
      }
    }

    // calculate the breathing frequency
    this.measured_spont_breath_freq = 60 / this.measured_spont_breath_counter
    this.measured_spont_breath_counter = 0
    this.measured_spont_updater_counter = 0

    // reset the breathing timer
    this.breath_timer_counter = 1;
  }

  modelStep() {

    // determine the breath timings
    if (this.spont_resp_rate > 0 && this.spont_breathing_enabled) {
      this.breath_timer_period = 60000 / this.spont_resp_rate;
    } else {
      this.breath_timer_period = 60000;
    }

    // calculate the respiratory rate and target tidal volume depending on the ANS
    this.vtrrController();

    // is it time for a new breath yet?
    if (this.breath_timer_counter > this.breath_timer_period) {
      this.startBreath();
    }

    // generate the muscle signal
    if (this.spont_resp_rate > 0 && this.spont_breathing_enabled) {
      this.resp_muscle_pressure = this.generateMuscleSignal();
    } else {
      this.resp_muscle_pressure = 0;
    }

    // transfer the respiratory muscle force to the chests
    this.model.components['CHEST_L'].external_pressure = this.resp_muscle_pressure;
    this.model.components['CHEST_R'].external_pressure = this.resp_muscle_pressure;

    // store the current volumes
    let volume = this.model.components['ALL'].vol_current + this.model.components['ALR'].vol_current;
    if (volume > this.temp_max_volume) {
      this.temp_max_volume = volume;
    }
    if (volume < this.temp_min_volume) {
      this.temp_min_volume = volume;
    }

    // calculate the volumes if not breathing quickly enough
    this.volume_time_counter += this.model.modeling_stepsize;
    if (this.volume_time_counter > 5.0) {
      this.calculateVolumes();
    }

    // increase the measure breathing frequency counter
    this.measured_spont_breath_counter += this.model.modeling_stepsize
    this.measured_spont_updater_counter += this.model.modeling_stepsize

    if (this.measured_spont_updater_counter > 5) {
      this.measured_spont_updater_counter = 0
      this.measured_spont_breath_freq = 60 / this.measured_spont_breath_counter
    }
    

    // increase the timers
    this.breath_timer_counter += this.model.modeling_stepsize * 1000;
  }
}
