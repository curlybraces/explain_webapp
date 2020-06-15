class ANS {
  constructor(_model) {
    this.model = _model;

    this.comp_ans = null;
    this.comp_ans_ad = null;
    this.comp_ans_ivc = null;
    this.comp_ans_svc = null;

    this.d_map_hp = 0;
    this.d_map_cont = 0;
    this.d_map_venpool = 0;
    this.d_map_res = 0;

    this.d_lungvol_hp = 0;
    this.d_po2_hp = 0;
    this.d_pco2_hp = 0;

    this.d_po2_ve = 0;
    this.d_pco2_ve = 0;
    this.d_ph_ve = 0;

    this.a_map = 0;
    this.a_lungvol = 0;
    this.a_po2 = 0;
    this.a_pco2 = 0;
    this.a_ph = 0;

    this.update_timer = 0;
  }

  activationCurve(value, saturation, operating_point, threshold) {
    let activation = 0;

    if (value >= saturation) {
      activation = saturation - operating_point;
    } else {
      if (value <= threshold) {
        activation = threshold - operating_point;
      } else {
        activation = value - operating_point;
      }
    }
    return activation;
  }
  modelStep() {
    if (this.update_timer >= this.model.modeling_interval) {
      this.update_timer = 0;
      this.updateANS()
    }
    this.update_timer += this.model.modeling_stepsize
  }

  updateANS() {
      
    // calculate the acidbase and oxygenation in the relevant compartments
      this.model.acidbase(this.model.components['AA'], this.model)
      this.model.oxygenation(this.model.components['AA'], this.model)

      let t = this.model.modeling_interval; // in sec

      // calculate the activation values
      this.a_map = this.activationCurve(
        this.model.components['AA'].pres_current,
        this.sa_map,
        this.op_map,
        this.th_map
      );
      this.a_lungvol = this.activationCurve(
        this.model.components['AA'].pres_current,
        this.sa_lungvol,
        this.op_lungvol,
        this.th_lungvol
      );
      this.a_po2 = this.activationCurve(
        this.model.components['AA'].po2,
        this.sa_po2,
        this.op_po2,
        this.th_po2
      );
      this.a_pco2 = this.activationCurve(
        this.model.components['AA'].pco2,
        this.sa_pco2,
        this.op_pco2,
        this.th_pco2
      );
      this.a_ph = this.activationCurve(
        this.model.components['AA'].ph,
        this.sa_ph,
        this.op_ph,
        this.th_ph
      );

      this.d_map_hp =
        t * ((1 / this.tc_map_hp) * (-this.d_map_hp + this.a_map)) +
        this.d_map_hp;
      this.d_lungvol_hp =
        t * ((1 / this.tc_lungvol_hp) * (-this.d_lungvol_hp + this.a_lungvol)) +
        this.d_lungvol_hp;
      this.d_po2_hp =
        t * ((1 / this.tc_po2_hp) * (-this.d_po2_hp + this.a_po2)) +
        this.d_po2_hp;
      this.d_pco2_hp =
        t * ((1 / this.tc_pco2_hp) * (-this.d_pco2_hp + this.a_pco2)) +
        this.d_pco2_hp;

      this.d_po2_ve =
        t * ((1 / this.tc_po2_ve) * (-this.d_po2_ve + this.a_po2)) +
        this.d_po2_ve;
      this.d_pco2_ve =
        t * ((1 / this.tc_pco2_ve) * (-this.d_pco2_ve + this.a_pco2)) +
        this.d_pco2_ve;
      this.d_ph_ve =
        t * ((1 / this.tc_ph_ve) * (-this.d_ph_ve + this.a_ph)) + this.d_ph_ve;

      this.d_map_cont =
        t * ((1 / this.tc_map_cont) * (-this.d_map_cont + this.a_map)) +
        this.d_map_cont;
      this.d_map_venpool =
        t * ((1 / this.tc_map_venpool) * (-this.d_map_venpool + this.a_map)) +
        this.d_map_venpool;
      this.d_map_res =
        t * ((1 / this.tc_map_res) * (-this.d_map_res + this.a_map)) +
        this.d_map_res;

      if (this.is_enabled) {
        // # calculate the heartrate
        this.model.models.ecg["heart_rate"] =
          60000.0 /
          (60000.0 / this.model.models.ecg["heart_rate_ref"] +
            this.g_map_hp * this.d_map_hp +
            this.g_pco2_hp * this.d_pco2_hp +
            this.g_po2_hp * this.d_po2_hp +
            this.g_lungvol_hp * this.d_lungvol_hp);

        // calculate the target exhaled minute volume
        this.model.models.breathing["target_minute_volume"] =
          this.model.models.breathing["ref_minute_volume"] +
          this.g_ph_ve * this.d_ph_ve +
          this.g_pco2_ve * this.d_pco2_ve +
          this.g_po2_ve * this.d_po2_ve;

        if (this.model.models.breathing["target_minute_volume"] < 0) {
          this.model.models.breathing["target_minute_volume"] = 0;
        }
      }
  }
}
