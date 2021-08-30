/* eslint-disable */

class AVinteraction {
  constructor(_model) {
    this._model = _model;

    this.transfer_pressure = 0
  }

  modelStep() {
    if (this.is_enabled) {
      this.modelCycle();
    }
  }

  modelCycle() {
    // during the isovolumetric contraction of the RV the tricuspid valve is pushed into the right atrium
    // causing a rise into the intra-atrial pressure
    

    // during the isovolumetric contraction of the LV the mitral valve is pushed into the left atrium
    // causing a rise into the intra-atrial pressure



  }
}
