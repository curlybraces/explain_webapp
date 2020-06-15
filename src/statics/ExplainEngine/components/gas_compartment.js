class GasCompartment {
  // units of the gas compartment
  // pressure in mmHg
  // volume in litres
  // temperature in dgs C
  // concentration in mmol/l
  constructor(_model) {
    this.model = _model;

    this.pres_current = 0;
    this.ctotal = 0;
    this.co2 = 0;
    this.cco2 = 0;
    this.cn2 = 0;
    this.cother = 0;
    this.ch2o = 0;
    this.to2 = 0;

    this.ftotal = 0;
    this.fo2 = 0;
    this.fweto2 = 0;
    this.fco2 = 0;
    this.fn2 = 0;
    this.fother = 0;
    this.fh2o = 0;

    this.ptotal = 0;
    this.po2 = 0;
    this.pco2 = 0;
    this.pn2 = 0;
    this.pother = 0;
    this.ph2o = 0;

    this.container_pressure = 0;
    this.external_pressure = 0;


    this.gas_constant = 62.36367;

    this.first_run = true;

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
    if (this.vol_current >= this.el_max_volume * this.el_max_volume_factor) {
      return (
        this.el_baseline * this.el_baseline_factor +
        this.el_k2 *
          this.el_k2_factor *
          Math.pow(
            this.vol_current - this.el_max_volume * this.el_max_volume_factor,
            3
          )
      );
    }

    if (this.vol_current <= this.el_min_volume * this.el_min_volume_factor) {
      return (
        this.el_baseline * this.el_baseline_factor +
        this.el_k1 *
          this.el_k1_factor *
          Math.pow(
            this.vol_current - this.el_min_volume * this.el_min_volume_factor,
            3
          )
      );
    }

    return this.el_baseline * this.el_baseline_factor;
  }

  calcPressure() {
    // calculate unstressed volume
    this.vol_unstressed = this.vol_unstressed_baseline * this.vol_unstressed_baseline_factor;

    return (
      (this.vol_current - this.vol_unstressed) * this.calcElastance() +
      this.container_pressure +
      this.external_pressure +
      this.model.models.metabolism["p_atm"]
    );
  }

  gasIn(dvol, comp_from) {
    if (this.has_fixed_composition === 0) {
      // change the volume
      this.vol_current += dvol;
      if (this.vol_current < 0) {
        this.vol_current = 0.01;
      }

      let dco2 = dvol * (comp_from.co2 - this.co2);
      this.co2 = (this.co2 * this.vol_current + dco2) / this.vol_current;

      let dcco2 = dvol * (comp_from.cco2 - this.cco2);
      this.cco2 = (this.cco2 * this.vol_current + dcco2) / this.vol_current;

      let dcn2 = dvol * (comp_from.cn2 - this.cn2);
      this.cn2 = (this.cn2 * this.vol_current + dcn2) / this.vol_current;

      let dcother = dvol * (comp_from.cother - this.cother);
      this.cother =
        (this.cother * this.vol_current + dcother) / this.vol_current;

      let dch2o = dvol * (comp_from.ch2o - this.ch2o);
      this.ch2o = (this.ch2o * this.vol_current + dch2o) / this.vol_current;

      // calculate the new total
      this.ctotal = this.co2 + this.cco2 + this.cn2 + this.cother + this.ch2o;

      this.fo2 = this.co2 / this.ctotal;
      this.fco2 = this.cco2 / this.ctotal;
      this.fn2 = this.cn2 / this.ctotal;
      this.fh2o = this.ch2o / this.ctotal;
      this.fother = this.cother / this.ctotal;

      // update the partial pressures
      this.po2 = this.fo2 * this.pres_current;
      this.pco2 = this.fco2 * this.pres_current;
      this.pn2 = this.fn2 * this.pres_current;
      this.ph2o = this.fh2o * this.pres_current;
      this.pother = this.fother * this.pres_current;
    } else {
      this.calcCompositionFromFractions();
    }
  }

  gasOut(dvol) {
    if (this.has_fixed_composition == 0) {
      this.vol_current -= dvol;
      if (this.vol_current < 0) {
        this.vol_current = 0.01;
      }
    }
  }

  calcCompositionFromFractions() {
    // calculate the wet o2 fraction.
    this.fweto2 = this.fo2 - this.fh2o;

    // calculate the concentration of all particles in the air at this pressure, volume and temperatuur in mmol/l.
    this.ctotal =
      ((this.pres_current * this.vol_current) /
        (this.gas_constant * (273.15 + this.temp)) /
        this.vol_current) *
      1000;

    // calculate the partial pressures depending on the concentrations.
    // we need the concentrations to calculate the changes due to gas flows.
    this.co2 = this.fweto2 * this.ctotal;
    this.cco2 = this.fco2 * this.ctotal;
    this.cn2 = this.fn2 * this.ctotal;
    this.ch2o = this.fh2o * this.ctotal;
    this.cother = this.fother * this.ctotal;

    // calculate the partial pressures in mmHg.
    this.po2 = this.fweto2 * this.pres_current;
    this.pco2 = this.fco2 * this.pres_current;
    this.pn2 = this.fn2 * this.pres_current;
    this.ph2o = this.fh2o * this.pres_current;
    this.pother = this.fother * this.pres_current;
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
      this.pres_current = this.calcPressure();

      this.analyzePressures();
      
      if (this.first_run) {
        this.calcCompositionFromFractions();
        this.first_run = false;
      }
    }
  }
}
