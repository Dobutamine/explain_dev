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
    // fixed flow naar lymphagion

    // elke model step een absoluet volume toevoegen
    const flowP = 10

    let volumeLB = this._model.components.LB.vol

    let dvol = volumeLB * flowP / 100

    this._model.components.LYMPHANGION.volIn(dvol, null, false)

    this._model.components.LB.volOut(dvol)

    let t = this._model.modeling_stepsize

    this.tijd += t













    // stepsize
    // const t = this._model.modeling_stepsize

    
    // let volumeLB = this._model.components.LB.vol     // in liters

    // // calculate flow as 10% of lower body
    // let flowInThisStepExp = this.flowPercentage / 100 * volumeLB

    // // remove volume from lower body and add to lymfangiom
    // // change the volumes
    // this._model.components.LB.volOut(flowInThisStepExp)

    // this._model.components.LYMPHANGION.volIn(flowInThisStepExp, null, false)


    

  }
}