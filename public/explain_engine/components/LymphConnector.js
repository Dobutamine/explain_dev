/* eslint-disable */

class LymphConnector {
  constructor(_model) {

    // declare a reference to the global model which is injected in this class
    this._model = _model;

    // declare the state variables which are not in the model definition file
    this.res = 0;
    this._flow = 0;
    this.real_flow = 0;

    this.r_for_fac = 1;
    this.r_back_fac = 1;
    this.r_k1_fac = 1;
    this.r_k2_fac = 1;

    this.initialized = false

  }

  calcResistance(pres1, pres2) {

    // calculate the flow dependent parts
    const nonlinear_fac1 = this.r_k1 * this.r_k1_fac * this._flow;
    const nonlinear_fac2 = this.r_k2 * this.r_k2_fac * Math.pow(this._flow, 2);


    if (pres1 > pres2) 
    {
      // resistance if forward flow
      return this.r_for * this.r_for_fac + nonlinear_fac1 + nonlinear_fac2;
    } 
      else 
    {
      // resistance if backward flow
      return this.r_back * this.r_back_fac + nonlinear_fac1 + nonlinear_fac2
    }
    
  }

  modelStep() {

    if (!this.initialized) {

      // find the current model stepsize
      this.t = this._model["modeling_stepsize"]

      // find a reference to the compartments which are connected by this connector
      this.comp1 = this._model.components[this.comp_from];
      this.comp2 = this._model.components[this.comp_to];

      // flag that the connector is initialized
      this.initialized = true
    }
    
    if (this.is_enabled && !this.no_flow) {
      // get the current pressures
      const pres1 = this.comp1.pres
      const pres2 = this.comp2.pres

      // calculate the current resistance
      this.res = this.calcResistance(pres1, pres2);

      // find the flow direction
      if (pres1  > pres2 ) {

        // calculate the flow with direction from comp1 to comp2
        this._flow = (pres1 - pres2) / this.res;

        // first check whether comp1 has enough blood volume left
        if (this.comp1.vol < this._flow * this.t) {
          this._flow = this.comp1.vol / this.t
        }

        // remove blood in liters from comp1
        this.comp1.volOut(this._flow * this.t);

        // add blood in liters to comp2
        this.comp2.volIn(this._flow * this.t, this.comp1, false);

        // store the real flow
        this.real_flow = this._flow;

      } else {
        
        // if no backflow allowed set the flow to zero
        if (this.no_backflow) {
          this._flow = 0;
          this.real_flow = 0;
        } else {

          // calculate the flow with direction from comp2 to comp1 
          this._flow = (pres2 - pres1) / this.res;
          
          // first check whether comp1 has enough blood volume left
          if (this.comp2.vol < this._flow * this.t) {
            this._flow = this.comp2.vol / this.t
          }

          // remove lymph from comp2 in lieters
          this.comp2.volOut(this._flow * this.t);

          // add lymph to comp1 in liters
          this.comp1.volIn(this._flow * this.t, this.comp2, false)

          // store the real flow (flip the sign as the real flow is backwards)
          this.real_flow = -this._flow;
        }
      }
    } else {
      // no flow state as the flag no_flow is true
      this._flow = 0;
      this.real_flow = 0;
    }

  }

}
