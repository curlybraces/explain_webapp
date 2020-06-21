class Exchanger {
  constructor(_model) {
    this.model = _model;
  }

  modelStep() {
    if (this.is_enabled) {
      this.modelCycle();
    }
  }

  modelCycle() {
    // calculate the flux
    // diff = mmol / mmHg * sec
    // flux is in mmol !!!

    this.model.acidbase(this.model.components[this.comp_blood], this.model);
    this.model.oxygenation(this.model.components[this.comp_blood], this.model);

    let blood_compartment = this.model.components[this.comp_blood];
    let gas_compartment = this.model.components[this.comp_gas];

    this.flux_o2 =
      (blood_compartment.po2 - gas_compartment.po2) *
      (this.diff_o2 * this.diff_o2_factor) *
      this.model.modeling_stepsize;

    // in blood the pco2 is in kPa and in the gas in mmHg
    this.flux_co2 =
      (blood_compartment.pco2 - gas_compartment.pco2) *
      (this.diff_co2 * this.diff_co2_factor) *
      this.model.modeling_stepsize;

    if (Number.isNaN(this.flux_o2)) {
      this.flux_o2 = 0;
    }

    if (Number.isNaN(this.flux_co2)) {
      this.flux_co2 = 0;
    }

    if (blood_compartment.is_enabled) {
      if (blood_compartment.vol_current > 0) {
        blood_compartment.to2 =
          (blood_compartment.to2 * blood_compartment.vol_current -
            this.flux_o2) /
          blood_compartment.vol_current;

        if (blood_compartment.to2 < 0) {
          blood_compartment.to2 = 0.0;
        }

        blood_compartment.tco2 =
          (blood_compartment.tco2 * blood_compartment.vol_current -
            this.flux_co2) /
          blood_compartment.vol_current;

        if (blood_compartment.tco2 < 0) {
          blood_compartment.tco2 = 0.0;
        }
      }
    }
    if (gas_compartment.is_enabled) {
      if (gas_compartment.vol_current > 0) {
        gas_compartment.ctotal =
          (gas_compartment.ctotal * gas_compartment.vol_current +
            this.flux_o2 +
            this.flux_co2) /
          gas_compartment.vol_current;

        gas_compartment.co2 =
          (gas_compartment.co2 * gas_compartment.vol_current + this.flux_o2) /
          gas_compartment.vol_current;

        if (gas_compartment.co2 < 0) {
          gas_compartment.co2 = 0;
        }

        gas_compartment.cco2 =
          (gas_compartment.cco2 * gas_compartment.vol_current + this.flux_co2) /
          gas_compartment.vol_current;

        if (gas_compartment.cco2 < 0) {
          gas_compartment.cco2 = 0;
        }

        gas_compartment.fo2 = gas_compartment.co2 / gas_compartment.ctotal;
        gas_compartment.fco2 = gas_compartment.cco2 / gas_compartment.ctotal;

        gas_compartment.po2 =
          gas_compartment.fo2 *
          (gas_compartment.pres_current -
            gas_compartment.pres_current * gas_compartment.fh2o);
        gas_compartment.pco2 =
          gas_compartment.fco2 *
          (gas_compartment.pres_current -
            gas_compartment.pres_current * gas_compartment.fh2o);
      }
    }
  }
}
