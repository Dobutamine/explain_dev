/* eslint-disable */

import init, { start_model, stop_model, calculate_model, fastforward_model, load_modeldefinition } from './pkg/rust_explain_engine'

export class RustInterface {
  initialized = false

  constructor () {
    init().then(() => {
      this.initialized = true
      console.log('JS-Rust interface intialized.')
    })
  }

  loadModeldefinition (json) {
    load_modeldefinition(json)
  }

  startModel () {
    start_model()
  }

  stopModel () {
    stop_model()
  }

  fastForwardModel () {
    fastforward_model()
  }

  calculateModel () {
    calculate_model()
  }

}
