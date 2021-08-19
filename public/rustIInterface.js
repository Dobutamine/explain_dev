/* eslint-disable */

import init, { start_model, stop_model, calculate_model, fastforward_model, load_modeldefinition} from './pkg/rust_explain_engine'

export class RustInterface {
  constructor () {
    init()

    // init().then(() => {
    //   console.log('WASM module is initialized!')
    // })
  }

  loadModeldefinition () {
    load_modeldefinition()
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
