/* eslint-disable */
import init, { greet } from './pkg/rust_explain_engine'

export class RustInterface {
  constructor () {

    init().then(() => {
      // greet('WebAssembly is the greatest!')
    })
  }
}
