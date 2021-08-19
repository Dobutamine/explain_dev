import { RustInterface } from 'app/public/rustIInterface'

// eslint-disable-next-line prefer-const
let rustInterface = new RustInterface()

export default ({ Vue }) => {
  Vue.prototype.$rust = rustInterface
}

export { rustInterface as rust }
