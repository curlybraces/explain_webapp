class Container {
  constructor(_model) {
    // declare a reference to the global model which is injected in this class
    this.model = _model;

    // declare the state variables which are not in the model definition file
    this.pres_current = 0;
    this.external_pressure = 0;

    // max and min pressures
    this.pres_max = 0;
    this.pres_max_temp = -1000;

    this.pres_min = 0;
    this.pres_min_temp = 1000;

    // max and min volumes
    this.vol_max = 0;
    this.vol_max_temp = -1000;

    this.vol_min = 0;
    this.vol_min_temp = 1000;

    this.analyzer_timer = 0;
    this.analyzer_interval = 3;
  }

  calcVolume() {
    let total_volume = 0;
    this.compartments.forEach((comp) => {
      total_volume += this.model.components[comp].vol_current;
    });
    return total_volume;
  }

  calcElastance() {
    this.el_current = this.el_baseline * this.el_baseline_factor;

    if (this.vol_current >= this.el_max_volume * this.el_max_volume_factor) {
      this.el_current =
        this.el_baseline * this.el_baseline_factor +
        this.el_k2 *
          this.el_k2_factor *
          Math.pow(
            this.vol_current - this.el_max_volume * this.el_max_volume_factor,
            3
          );
    }

    if (this.vol_current <= this.el_min_volume * this.el_min_volume_factor) {
      this.el_current =
        this.el_baseline * this.user_el_multiplier +
        this.el_k1 *
          this.el_k1_factor *
          Math.pow(
            this.vol_current - this.el_min_volume * this.el_min_volume_factor,
            3
          );
    }

    return this.el_current;
  }

  calcPressure() {
    // calculate the unstressed volume
    this.vol_unstressed =
      this.vol_unstressed_baseline * this.vol_unstressed_baseline_factor;

    // return the container pressure
    return (
      (this.vol_current - this.vol_unstressed) * this.calcElastance() +
      this.external_pressure
    );
  }

  analyzePressures() {
    if (this.analyzer_timer > this.analyzer_interval) {
      this.analyzer_timer = 0;

      this.pres_max = this.pres_max_temp;
      this.pres_min = this.pres_min_temp;

      this.vol_max = this.vol_max_temp;
      this.vol_min = this.vol_min_temp;

      this.pres_max_temp = -1000;
      this.pres_min_temp = 1000;

      this.vol_max_temp = -1000;
      this.vol_min_temp = 1000;
    }
    if (this.pres_current > this.pres_max_temp) {
      this.pres_max_temp = this.pres_current;
    }
    if (this.pres_current < this.pres_min_temp) {
      this.pres_min_temp = this.pres_current;
    }

    if (this.vol_current > this.vol_max_temp) {
      this.vol_max_temp = this.vol_current;
    }
    if (this.vol_current < this.vol_min_temp) {
      this.vol_min_temp = this.vol_current;
    }

    this.analyzer_timer += this.model.modeling_stepsize;
  }

  modelStep() {
    if (this.is_enabled) {
      // add the enclosed compartment volumes to the volume of the container
      this.vol_current = this.calcVolume();

      // calculate the recoil pressure of the container
      this.pres_current = this.calcPressure();

      // transfer the recoil pressure to the enclosed compartments
      this.compartments.forEach((comp) => {
        this.model.components[comp].container_pressure = this.pres_current;
      });

      this.analyzePressures();
    }
  }
}
