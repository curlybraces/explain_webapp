class Heart {
  constructor(_model) {
    this.model = _model;
  }

  modelStep() {
    if (this.is_enabled) {
      this.modelCycle();
    }
  }

  // the model step function is called during every step of the model
  modelCycle() {
    const t = this.model["modeling_stepsize"];
    // varying elastance activation function of the atria

    let aaf_left = 0;
    let aaf_right = 0;

    if (
      this.model.models.ecg["ncc_atrial"] >= 0 &&
      this.model.models.ecg["ncc_atrial"] < this.model.models.ecg["pq_time"] / t
    ) {
      aaf_left = Math.pow(
        Math.sin(
          Math.PI *
            (this.model.models.ecg["ncc_atrial"] /
              this.model.models.ecg["pq_time"]) *
            t
        ),
        2
      );
    } else {
      aaf_left = 0;
    }

    if (
      this.model.models.ecg["ncc_atrial"] >= 0 &&
      this.model.models.ecg["ncc_atrial"] < this.model.models.ecg["pq_time"] / t
    ) {
      aaf_right = Math.pow(
        Math.sin(
          Math.PI *
            (this.model.models.ecg["ncc_atrial"] /
              this.model.models.ecg["pq_time"]) *
            t
        ),
        2
      );
    } else {
      aaf_right = 0;
    }

    // varying elastance activation function of the ventricles
    let vaf_left = 0;
    let vaf_right = 0;

    if (
      this.model.models.ecg["ncc_ventricular"] >= 0 &&
      this.model.models.ecg["ncc_ventricular"] <
        this.model.models.ecg["cqt_time"] / t
    ) {
      vaf_left = Math.pow(
        Math.sin(
          Math.PI *
            (this.model.models.ecg["ncc_ventricular"] /
              this.model.models.ecg["cqt_time"]) *
            t
        ),
        2
      );
    } else {
      vaf_left = 0;
    }
    if (
      this.model.models.ecg["ncc_ventricular"] >= 0 &&
      this.model.models.ecg["ncc_ventricular"] <
        this.model.models.ecg["cqt_time"] / t
    ) {
      vaf_right = Math.pow(
        Math.sin(
          Math.PI *
            (this.model.models.ecg["ncc_ventricular"] /
              this.model.models.ecg["cqt_time"]) *
            t
        ),
        2
      );
    } else {
      vaf_right = 0;
    }

    // increase the atrial and ventricular activation function timers
    this.model.models.ecg["ncc_atrial"] += 1;
    this.model.models.ecg["ncc_ventricular"] += 1;

    // transfer the activation function to the heart compartments
    this.model.components["RA"].el_contraction_activation = aaf_right;
    this.model.components["RV"].el_contraction_activation = vaf_right;
    this.model.components["LA"].el_contraction_activation = aaf_left;
    this.model.components["LV"].el_contraction_activation = vaf_right;
  }
}
