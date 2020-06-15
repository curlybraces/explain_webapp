class BloodCompartment {
  constructor(_model) {
    // declare a reference to the global model which is injected in this class
    this.model = _model;

    // declare the state variables which are not in the model definition file
    this.external_pressure = 0;
    this.container_pressure = 0;

    // max and min pressures
    this.pres_max = 0
    this.pres_max_temp = -1000

    this.pres_min = 0
    this.pres_min_temp = 1000

    // max and min volumes
    this.vol_max = 0
    this.vol_max_temp = -1000

    this.vol_min = 0
    this.vol_min_temp = 1000

    this.analyzer_timer = 0
    this.analyzer_interval = 3
  }

  calcElastance() {
    this.el_contraction =
      this.el_contraction_baseline *
      this.el_contraction_baseline_factor *
      this.el_contraction_activation;

    if (this.vol_current >= this.el_max_volume * this.el_max_volume_factor) {
      return (
        this.el_baseline * this.el_baseline_factor +
        this.el_contraction +
        this.el_k2 *
          this.el_k2_factor *
          Math.pow(
            this.vol_current - this.el_max_volume * this.el_max_volume_factor, 3)
      );
    }

    if (this.vol_current <= this.el_min_volume * this.el_min_volume_factor) {
      return (
        this.el_baseline * this.el_baseline_factor +
        this.el_contraction +
        this.el_k1 *
          this.el_k1_factor *
          Math.pow(
            this.vol_current - this.el_min_volume * this.el_min_volume_factor, 3)
      );
    }

    return this.el_baseline * this.el_baseline_factor + this.el_contraction;
  }

  calcPressure() {
    // calculate the unstressed volume
    this.vol_unstressed =
      this.vol_unstressed_baseline * this.vol_unstressed_baseline_factor;

    if (Number.isNaN(this.vol_unstressed)) {
      console.log(this.name);
    }

    return (
      (this.vol_current - this.vol_unstressed) * this.calcElastance() +
      this.container_pressure +
      this.external_pressure
    );
  }

  bloodIn(dvol, comp_from) {
    this.vol_current += dvol;
    if (this.vol_current < 0) {
      this.vol_current = 0.01;
    }

    // calculate the change in oxygen concentration
    let o2_infow = (comp_from.to2 - this.to2) * dvol;
    this.to2 = (this.to2 * this.vol_current + o2_infow) / this.vol_current;
    if (this.to2 < 0) {
      this.to2 = 0;
    }

    // calculate the change in carbon dioxide concentration
    let co2_infow = (comp_from.tco2 - this.tco2) * dvol;
    this.tco2 = (this.tco2 * this.vol_current + co2_infow) / this.vol_current;
    if (this.tco2 < 0) {
      this.tco2 = 0;
    }
  }

  bloodOut(dvol) {
    this.vol_current -= dvol;
    if (this.vol_current < 0) {
      this.vol_current = 0.01;
    }
  }

  co2Storage() {
    let resp_q_factor = 1.0;

    // // store co2 in tissues
    // if (this.tco2 > 25.0) {
    //   resp_q_factor = 1.0 / ((this.tco2 - 25.0) * 5.0 + 1.0);
    // }

    // // free co2 from the tissues
    // if (this.albumintco2 < 25.0) {
    //   resp_q_factor = 1.0 * ((25.0 - this.tco2) * 0.75 + 1.0);
    // }
    // if (tco2 < 24.0) {
    //   resp_q_factor = 1.0 * ((24.0 - this.tco2) * 2.0 + 1.0);
    // }

    resp_q_factor = 0.8;
    return resp_q_factor;
  }

  energyBalance() {
    // get the local ATP need in molecules per second
    let atp_need = this.fvatp * this.model.models.metabolism.atp_need;

    // new we need to know how much molecules ATP we need in this step
    let atp_need_step = atp_need * this.model.modeling_stepsize;

    // get the number of oxygen molecules available in this compartment
    let o2_molecules_available = this.to2 * this.vol_current;

    // we state that 80% of these molecules are available for use
    let o2_molecules_available_for_use = 0.8 * o2_molecules_available;

    // how many molecules o2 do we need to burn in this step as 1 molecule of o2 gives 5 molecules of ATP
    let o2_to_burn = atp_need_step / 5.0;

    // how many needed ATP molecules can't be produced by aerobic respiration
    let anaerobic_atp =
      (o2_to_burn - o2_molecules_available_for_use / 4.0) * 5.0;

    // if negative then there are more o2 molecules available than needed and shut down anaerobic fermentation
    if (anaerobic_atp < 0) {
      anaerobic_atp = 0;
    }

    let o2_burned = o2_to_burn;
    // if we need to burn more than we have then burn all available o2 molecules
    if (o2_to_burn > o2_molecules_available_for_use) {
      // burn all available o2 molecules
      o2_burned = o2_molecules_available_for_use;
    }

    // as we burn o2 molecules we have to substract them from the total number of o2 molecules
    o2_molecules_available -= o2_burned;

    // calculate the new TO2
    this.to2 = o2_molecules_available / this.vol_current;
    if (this.to2 < 0) {
      this.to2 = 0;
    }

    // we now know how much o2 molecules we've burnt so we also know how much co2 we generated depending on the respiratory quotient
    let co2_molecules_produced =
      o2_burned * this.model.models.metabolism.resp_q * this.co2Storage();

    // add the co2 molecules to the total co2 molecules
    this.tco2 =
      (this.tco2 * this.vol_current + co2_molecules_produced) /
      this.vol_current;
    if (this.tco2 < 0) {
      this.tco2 = 0;
    }
  }

  analyzePressures() {
    if (this.analyzer_timer > this.analyzer_interval) {
      this.analyzer_timer = 0

      this.pres_max = this.pres_max_temp
      this.pres_min = this.pres_min_temp

      this.vol_max = this.vol_max_temp
      this.vol_min = this.vol_min_temp
      
      this.pres_max_temp = -1000
      this.pres_min_temp = 1000

      this.vol_max_temp = -1000
      this.vol_min_temp = 1000
    }
    if (this.pres_current > this.pres_max_temp){
      this.pres_max_temp = this.pres_current
    }
    if (this.pres_current < this.pres_min_temp){
      this.pres_min_temp = this.pres_current
    }

    if (this.vol_current > this.vol_max_temp){
      this.vol_max_temp = this.vol_current
    }
    if (this.vol_current < this.vol_min_temp){
      this.vol_min_temp = this.vol_current
    }
    
    this.analyzer_timer += this.model.modeling_stepsize
  }
  
  modelStep() {
    if (this.is_enabled) {
      this.energyBalance();
      this.pres_current = this.calcPressure();
      this.analyzePressures()
    }
  }
}
