class ECMO {

  constructor(_model) {
    this.model = _model;
  }

  modelStep() {
    if (this.is_enabled) {
      this.modelCycle();
    }
  }

  modelCycle() {}
}
