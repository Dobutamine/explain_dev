use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen(start)]
pub fn run() {
    // run some code when the wasm module starts
    console::log_1(&"Rust code initialized.".into());
}

#[wasm_bindgen]
pub fn load_modeldefinition(model_definition: String) {
    console::log_1(&"Rust model definition loaded!!!!!!!".into());
    // let new_model = model_definition;
    // console::log_1(&new_model.into())
}

#[wasm_bindgen]
pub fn start_model() {
    console::log_1(&"Rust model started".into());
}

#[wasm_bindgen]
pub fn stop_model() {
    console::log_1(&"Rust model stopped".into());
}

#[wasm_bindgen]
pub fn calculate_model() {
    console::log_1(&"Rust model calculated".into());
}

#[wasm_bindgen]
pub fn fastforward_model() {
    console::log_1(&"Rust model fast forwarded".into());
}
