/* eslint-disable */

class LymphModel {
  constructor(_model) {
    this._model = _model;
  }

  modelStep() {
    if (this.is_enabled) {
      this.modelCycle();
    }
  }

  modelCycle() {
    // stepsize
    const t = this._model.modeling_stepsize
    // INPUTS -> FLOW is 10 ml/min = 0.01 l/min = 0.00016667 l/sec 
    const flowInThisStep = this.flow / 60 * t

    // remove volume from lower body and add to lymfangiom

    // change the volumes
    this._model.components.LB.volOut(flowInThisStep)
    this._model.components.LYMPHANGION.volIn(flowInThisStep, null, false)

  }
}