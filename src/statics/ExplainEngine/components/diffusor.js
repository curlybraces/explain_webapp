class Diffusor {
  modelStep() {}

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
