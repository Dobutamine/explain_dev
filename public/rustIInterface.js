/* eslint-disable */
import init, { greet } from './rust_engine/pkg/rust_engine'

export class RustInterface {
  constructor () {

    init().then(() => {
      // greet('WebAssembly is the greatest!')
    })
  }
}
