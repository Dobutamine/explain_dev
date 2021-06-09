/* eslint-disable */

class LymphModel {
  constructor(_model) {
    this._model = _model;

    this.tijd = 0
  }

  modelStep() {
    if (this.is_enabled) {
      this.modelCycle();
    }
  }

  modelCycle() {



  }
}