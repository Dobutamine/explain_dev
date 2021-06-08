/* eslint-disable */

class LymphModel {
  constructor(_model) {
    this._model = _model; 
    this.tijd = 0
    this.t1 = 0
    this.t_sin = 2
    this.t_period = 12
  }

  modelStep() {
    if (this.is_enabled) {
      this.modelCycle();
    }
  }

  modelCycle() {
    // stepsize
    // const t = this._model.modeling_stepsize

   // let volumeLB = this._model.components.LB.vol     // in liters

    // calculate flow as 10% of lower body
   // let flowInThisStepExp = this.flowPercentage / 100 * volumeLB

    // remove volume from lower body and add to lymfangiom
    // change the volumes
  //  this._model.components.LB.volOut(flowInThisStepExp)

  //  this._model.components.LYMPHANGION.volIn(flowInThisStepExp, null, false)

 const flowP = this.flowPercentage

 let volumeLB = this._model.components.LB.vol
 
 let dvol = volumeLB * flowP / 100 * this._model.modeling_stepsize

 this._model.components.LYMPHANGION.volIn(dvol, null, false)

 this._model.components.LB.volOut(dvol)
 
 let t = this._model.modeling_stepsize

 this.tijd += t

  
 //this._model.components.LYMPHANGION.el_act = Math.sin(2 * Math.PI * this._model.components.LYMPHANGION.freq * this.tijd)

 //if (this._model.components.LYMPHANGION.el_act > 0) {
 //  this._model.components.LYMPHANGION.el_act = Math.sin(2 * Math.PI * this._model.components.LYMPHANGION.freq * this.tijd)
 // } else {
 //   this._model.components.LYMPHANGION.el_act = 0;
 // }

  
if (this.t1/12 > 1) {
  this.t1 = this.t1 - this.t_period
} else { 
this.t1 = this.t1 + t
}

 if (this.t1 < this.t_sin) {
  this._model.components.LYMPHANGION.el_act = Math.sin(2 * Math.PI / (2 * this.t_sin) * this.t1)
  } else {
    this._model.components.LYMPHANGION.el_act = 0
  }

    // deze routine wordt elke 0.5 ms aangeroepen, dus weten de tijd

    // el_act moet varieren tussen 0 en 1 afhankelijk van de frequentie die wij willen


    // this._model.components.LYMPHANGION.el_act =  

    

  }
}