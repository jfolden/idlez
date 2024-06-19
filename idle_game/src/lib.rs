use wasm_bindgen::prelude::*;
use serde::Serialize;
use std::collections::HashMap;
use std::sync::Mutex;

#[macro_use]
extern crate lazy_static;

lazy_static! {
    static ref MATERIALS: Mutex<HashMap<String, i32>> = Mutex::new(HashMap::new());
    static ref GATHERING: Mutex<Option<Gathering>> = Mutex::new(None);
}

#[derive(Serialize)]
struct Gathering {
    material: String,
    duration: u64,
    start_time: f64,
}

#[wasm_bindgen]
pub fn start_gathering(material: &str, duration: u64, start_time: f64) {
    let mut gathering = GATHERING.lock().unwrap();
    *gathering = Some(Gathering {
        material: material.to_string(),
        duration,
        start_time,
    });
}

#[wasm_bindgen]
pub fn stop_gathering() {
    let mut gathering = GATHERING.lock().unwrap();
    *gathering = None;
}

#[wasm_bindgen]
pub fn get_gathering_info() -> JsValue {
    let gathering = GATHERING.lock().unwrap();
    if let Some(g) = gathering.as_ref() {
        serde_wasm_bindgen::to_value(&g).unwrap()
    } else {
        JsValue::NULL
    }
}

#[wasm_bindgen]
pub fn gather_material(material: &str) -> i32 {
    let mut materials = MATERIALS.lock().unwrap();
    let counter = materials.entry(material.to_string()).or_insert(0);
    *counter += 1;
    *counter
}

#[wasm_bindgen]
pub fn get_material(material: &str) -> i32 {
    let materials = MATERIALS.lock().unwrap();
    *materials.get(material).unwrap_or(&0)
}
