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

    let volumeLB = this._model.components.LB.vol     // in liters

    // calculate flow as 10% of lower body
    let flowInThisStepExp = this.flowPercentage / 100 * volumeLB

    // remove volume from lower body and add to lymfangiom
    // change the volumes
    this._model.components.LB.volOut(flowInThisStepExp)

    this._model.components.LYMPHANGION.volIn(flowInThisStepExp, null, false)


    // deze routine wordt elke 0.5 ms aangeroepen, dus weten de tijd

    // el_act moet varieren tussen 0 en 1 afhankelijk van de frequentie die wij willen


    // this._model.components.LYMPHANGION.el_act = 

    

  }
}