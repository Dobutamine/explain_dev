/* eslint-disable */

import init, { start_model, stop_model, calculate_model, fastforward_model, load_modeldefinition } from './pkg/rust_explain_engine'

export class RustInterface {
  initialized = false

  constructor () {
    // locate the wasm packages
    const url = (import.meta.url).replace('/public', '/pkg')

    // build the url string to find the wasm packages
    const input = new URL('rust_explain_engine_bg.wasm', url);
    init(input).then(() => {
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
