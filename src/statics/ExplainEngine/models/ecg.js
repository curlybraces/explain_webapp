class ECG {
  constructor(_model) {
    this.model = {};

    this.normalQRSWave = [-8, 3, 96, -104, 4, 9, 0, 0];
    this.ventQRSWave = [-25, 20, 50, -150, 20, 20, 20, 15, 10, 10, 10];

    this.p_wave_signal_counter = 0;
    this.qrs_wave_signal_counter = 0;
    this.t_wave_signal_counter = 0;

    this.ecg_signal = 0;
    this.prev_p_signal = 0;
    this.prev_t_signal = 0;

    this.sa_node_period = 0;
    this.sa_node_counter = 0;

    this.pq_time_counter = 0;
    this.pq_running = false;

    this.qrs_time_counter = 0;
    this.qrs_running = false;

    this.qt_time_counter = 0;
    this.qt_running = false;

    this.ventricle_is_refractory = false;

    this.measured_heartrate = 0;
    this.measured_heartrate_time_counter = 0;
    this.measured_heartrate_qrs_counter = 0;

    this.model = _model;
    this.update_timer = 0;

  }

  qtc() {
    if (this.heart_rate > 0) {
      return this.qt_time * Math.sqrt(60.0 / this.heart_rate);
    } else {
      return this.qt_time * Math.sqrt(60.0 / 10.0);
    }
  }
  modelStep() {
    // the ecg is updated every modeling_interval and not every modeling_stepsize 
    // for performance reasons
    if (this.update_timer >= this.model.modeling_interval) {
      this.update_timer = 0
      this.updateECG(this.model.modeling_interval)
    }
    this.update_timer += this.model.modeling_stepsize
  }

  updateECG(model_interval) {
    // calculate the corrected qt time
    this.cqt_time = this.qtc() - this.qrs_time;

    // calculate the sa_node_time in seconds depending on the heartrate
    if (this.heart_rate > 0) {
      this.sa_node_period = 60 / this.heart_rate;
    } else {
      this.sa_node_period = 60;
    }

    // has the sa node period elapsed
    if (this.sa_node_counter > this.sa_node_period) {
      this.sa_node_counter = 0;
      this.pq_running = true;
      this.ncc_atrial = 0;
    }

    // has the pq time elapsed?
    if (this.pq_time_counter > this.pq_time) {
      this.pq_time_counter = 0;
      this.pq_running = false;
      if (this.ventricle_is_refractory === false) {
        this.qrs_running = true;
        this.ncc_ventricular = 0;
        this.measured_heartrate_qrs_counter += 1;
      }
    }

    if (this.measured_heartrate_qrs_counter > 5) {
      this.measured_heartrate = 60 / (this.measured_heartrate_time_counter / this.measured_heartrate_qrs_counter);
      this.measured_heartrate_qrs_counter = 0;
      this.measured_heartrate_time_counter = 0;
    }

    // has the qrs time elapsed?
    if (this.qrs_time_counter > this.qrs_time) {
      this.qrs_time_counter = 0;
      this.ecg_signal = 0;
      this.qrs_running = false;
      this.qt_running = true;
      this.ventricle_is_refractory = true;
    }

    // has the qt time elapsed?
    if (this.qt_time_counter > this.cqt_time) {
      this.qt_time_counter = 0;
      this.qt_running = false;
      this.ventricle_is_refractory = false;
    }

    // increase the counters
    this.measured_heartrate_time_counter += model_interval;

    this.sa_node_counter += model_interval;
    // only increase the timers when running
    if (this.pq_running) {
      this.pq_time_counter += model_interval;
      this.buildDynamicPWave();
      this.p_wave_signal_counter += 1;
    } else {
      this.p_wave_signal_counter = 0;
    }
    if (this.qrs_running) {
      this.qrs_time_counter += model_interval;
      this.buildQRSWave();
      this.qrs_wave_signal_counter += 1;
    } else {
      this.qrs_wave_signal_counter = 0;
    }
    if (this.qt_running) {
      this.qt_time_counter += model_interval;
      this.buildDynamicTWave();
      this.t_wave_signal_counter += 1;
    } else {
      this.t_wave_signal_counter = 0;
    }

    if (
      this.pq_running === false &&
      this.qrs_running === false &&
      this.qt_running === false
    ) {
      this.ecg_signal = 0;
    }

    this.model.models.ecg['ecg_signal'] = this.ecg_signal;
    this.model.models.ecg['measured_heartrate'] = this.measured_heartrate;
  }
  buildDynamicPWave() {
    let duration = this.model.models.ecg['pq_time'];
    let amp_p = this.model.models.ecg['amp_p'];
    let width_p = this.model.models.ecg['width_p'];
    let skew_p = this.model.models.ecg['skew_p'];

    let new_p_signal =
      amp_p *
      Math.exp(
        -width_p *
          (Math.pow(this.pq_time_counter - duration / skew_p, 2) /
            Math.pow(duration, 2))
      );
    let delta_p = new_p_signal - this.prev_p_signal;
    this.ecg_signal += delta_p;
    this.prev_p_signal = new_p_signal;
  }
  buildQRSWave() {
    if (this.qrs_wave_signal_counter < this.normalQRSWave.length) {
      this.ecg_signal += this.normalQRSWave[this.qrs_wave_signal_counter];
    } else {
      this.qrs_wave_signal_counter = 0;
    }
  }
  buildDynamicTWave() {
    let duration = this.cqt_time;
    let amp_t = this.model.models.ecg['amp_t'];
    let width_t = this.model.models.ecg['width_t'];
    let skew_t = this.model.models.ecg['skew_t'];

    let new_t_signal =
      amp_t *
      Math.exp(
        -width_t *
          (Math.pow(this.qt_time_counter - duration / skew_t, 2) /
            Math.pow(duration, 2))
      );
    let delta_t = new_t_signal - this.prev_t_signal;
    this.ecg_signal += delta_t;
    this.prev_t_signal = new_t_signal;
  }
}
