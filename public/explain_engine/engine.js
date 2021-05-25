/* eslint-disable */

// This is a dedicated web worker instance for the physiological model engine
// Web workers run in a separate thread for performance reasons and have no access to the DOM nor the window object
// The scope is defined by self and communication with the main thread by a message channel
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#web_workers_api

// Communication with the script which spawned the web worker takes place through a com channel 
// Messages are received in the onmessage event and are sent by the SendMessage function

// Explain message object :
/* {
  type:       <string> stating the type of message (set/get/cmd)
  target:     <string> stating the component of the model for which the message is intended (p.e. 'datalogger'/'interventions')
  action:     <string> stating the action name
  data:       <object> containing data to pass to the action
  return_tag: <string> if data is returned from the above action it is tagged with this string.
}
*/

// import the helper classes
importScripts("./helpers/Interventions.js");
importScripts("./helpers/datalogger.js");
importScripts("./helpers/math_functions.js");

// define an object which is going to hold available possible component types
let componentTypes = {}

// define an object which is going to hold available possible monitor types
let monitorTypes = {}

// define an object which is going to hold the entire model state and properties
let current_model = {};

// define an object which is going to hold the model definition as defined by a json definition file
let model_definition = {};

// model changes take place through an event called an intervention
// interventions are stored in an object which is defined here
let interventions = {};

// model data is logged by the datalogger, its's placeholder is defined here
let datalogger = {};

// define the main timer for the real-time modeling modes and set the realtime reporting interval
let main_timer;
let realtime_step = 0.03

let total_volume = 0
// the onmessage function is an event handler handling messages posted to the model engine worker thread.
// e is a MessageEvent object wich contains a data field containing the message
onmessage = function (e) {
  
  switch (e.data.type) {
    // getting data from the model.
    case "get":
      if (e.data.target === "datalogger") {
        // getting data from the datalogger of the model
        sendMessage("data", e.data.return_tag, null, datalogger[e.data.action](e.data.data))
        sendMessage("mes", null, null, ['ready']);
      }
      if (e.data.target === 'model_definition') {
        sendMessage("data", e.data.return_tag, null, model_definition)
      }
      break;
    
    case "set_direct":
      // set a model property directly (dangerous!)
      if (typeof current_model.components[e.data.target][e.data.action] === 'number') {
        current_model.components[e.data.target][e.data.action] = parseFloat(e.data.data)
      } else {
        current_model.components[e.data.target][e.data.action] = e.data.data
      }
      // send message that the property is set
      sendMessage("mes", null, null, [`${e.data.target}.${e.data.action} = ${e.data.data}`]);
      break;

    case "set": 
      if (e.data.target === "datalogger" | e.data.target === "Datalogger") {
        // setting data handled by the datalogger of the model
        datalogger[e.data.action](e.data.data)
      }
      
      if (e.data.target === "interventions" | e.data.target === "Interventions") {
        // setters data handled by the interventions engine
        interventions[e.data.action](e.data.data)
      }

      if (e.data.target === "Ventilator") {
        // setters data handled by the interventions engine
        current_model.components['Ventilator'][e.data.action](e.data.data)
      }

      if (e.data.target === "IV") {
        // setters data handled by the interventions engine
        current_model.components['IV'][e.data.action](e.data.data)
      }

      if (e.data.action === "change_property") {
        // directly set a parameter on the model
        current_model.components[e.data.target] = e.data.data
      }
      break; 

    case "cmd":
      // execute commands in the engine
      switch (e.data.action) {
        case "load":
          loadModel(e.data.data);
          break;
        case "start":
          startModel();
          break;
        case "stop":
          stopModel();
          break;
        case "calculate":
          if (e.data.data === null) {
            // if no duration is supplied calculate 10 seconds
            calculateModel(10);
          } else {
            // calculate a number of seconds of the model
            calculateModel(e.data.data);
          }
          break;
        case "goto":
          fastForwardModel(e.data.data)
          break
        default:
          break;
      }
      break;
    
    default:
      // if the incoming message is nog recognized it is displayed on the console 
      this.console.log(
        "model received unknown command ",
        e.data.type,
        e.data.subtype,
        e.data.target,
        e.data.data
      );
      break;
  }
};

// routine to send messages to the main thread
const sendMessage = function (type, target, action, data, return_tag) {
  postMessage({
    type,
    target,
    action,
    data,
    return_tag
  });
};

// initialize the model from the JSON model_definition file
const initModel = function (model_definition) {

  if (model_definition) {
    // set the general properties as weight and name from the definition file
    current_model["weight"] = model_definition["weight"];
    current_model["name"] = model_definition["name"];
    current_model["description"] = model_definition["description"];

    // set the modeling stepsize of the model in seconds
    current_model["modeling_stepsize"] = model_definition["modeling_stepsize"];

    // set the model total running time and timestamp arrays to timestamp the data
    current_model["model_time_total"] = 0;

    // define the dictionary holding all model components in the current model instance
    current_model["components"] = {};

    // initialize all the components by first finding out what components are configures in the JSON file
    initializeComponents(model_definition)

    // initialize all the global non component functions
    initializeGlobals(model_definition)

    // initialize all the monitors
    initializeMonitors(model_definition)

    // import and initialize the datalogger
    datalogger = new Datalogger(current_model);

    // import and initialize the interventions engine
    interventions = new Interventions(current_model);

    sendMessage("mes", null, null, ["ready"]);
  }
};

const initializeGlobals = function (model_definition) {
   // initialize global functions
   model_definition["globals"].forEach(component => {
    if (component.type === 'global_component') {
      const compFileName = "./components/" + component.subtype + ".js"
      try {
        // import the component code
        importScripts(compFileName);
        current_model[component.global_functions[0]] = eval(component.global_functions[0])
      } catch {
        console.log('error: ' , compFileName)
      }  
    }
  })
}

const initializeMonitors = function (model_definition) {
  // initialize all the components by first finding out what components are configures in the JSON file
  let monitorTypes = []
  model_definition["monitoring"].forEach(monitor => {
    if (monitor.subtype !== ""){
      monitorTypes.push(monitor.subtype)
    }
  })
  // remove duplicates
  const monitorList = [...new Set(monitorTypes)]

  // build a dictionary with all component types ready to be dynamically instantiated
  monitorList.forEach(monitorType => {
    // construct the component file name
    const monitorFileName = "./helpers/" + monitorType + ".js"
    try {
      // import the component code
      importScripts(monitorFileName);
      // store the component type in a dictionary
      monitorTypes[monitorType] = eval(monitorType);
    } catch {
      console.log('error: ' , monitorFileName)
    }
  })

  // now we're going to read the JSON file and instatiate the desired type and populate the properties
  model_definition["monitoring"].forEach(monitor => {
    if (monitor.subtype !== ""){
      // instantiate the component type and add a reference to the current model!
      let newMonitor = new monitorTypes[monitor.subtype](current_model)
      // add the properties
      Object.keys(monitor).forEach(function (prop) {
        newMonitor[prop] = monitor[prop];
      });
      // add the new component to the currentmodel
      current_model.components[monitor.name] = newMonitor
    }
  })
}
// initialize the  model components from the model_definition file
const initializeComponents = function (model_definition) {

  // initialize all the components by first finding out what components are configures in the JSON file
  let componentTypes = []
  model_definition["components"].forEach(component => {
    if (component.subtype !== ""){
      componentTypes.push(component.subtype)
    }
  })

  // remove duplicates
  const componentList = [...new Set(componentTypes)]

  // build a dictionary with all component types ready to be dynamically instantiated
  componentList.forEach(compType => {
    // construct the component file name
    const compFileName = "./components/" + compType + ".js"
    try {
      // import the component code
      importScripts(compFileName);
      // store the component type in a dictionary
      componentTypes[compType] = eval(compType);
    } catch(err) {
      console.log('error: ' , compFileName, err.message)
    }
  })

  // now we're going to read the JSON file and instatiate the desired type and populate the properties
  model_definition["components"].forEach(component => {
    if (component.subtype !== ""){
      // instantiate the component type and add a reference to the current model!
      let newComponent = new componentTypes[component.subtype](current_model)
      // add the properties
      Object.keys(component).forEach(function (prop) {
        newComponent[prop] = component[prop];
      });
      // add the new component to the currentmodel
      current_model.components[component.name] = newComponent
    }
  })
}

// load and initialize a new model from a json model definition object
const loadModel = function (json_model_definition) {
  current_model = {}
  model_definition = json_model_definition;

  // notify that the model is loaded
  sendMessage("mes", null, null, [`model engine loaded with '${json_model_definition.name}' definition.`]);
 
  // initialize the model with the just loaded model definition
  initModel(model_definition);
};

// dispose of the current model
const disposeModel = function () {
  // stop the main timer
  if (main_timer) {
    clearInterval(main_timer);
    clearTimeout(main_timer)
  }
  main_timer = null

  // erase the current model object
  current_model = {};

  sendMessage("mes", null, null, ["model disposed"]);
  sendMessage("mes", null, null, ['ready']);
};

// calculate a number of seconds of the model and storing data
const calculateModel = function (time_to_calculate) {

  total_volume = 0

  // first switch off datalogger realtime mode
  datalogger.realtime = false;

  // calculate the number of steps needed for the time_to_calculate
  let no_needed_steps = parseInt(time_to_calculate / current_model.modeling_stepsize);

  // send starting messages for this model run
  sendMessage("mes", null, null, ['calculating']);
  sendMessage("mes", null, null, [`model clock at ${Math.round(current_model.model_time_total)} sec.`]);
  sendMessage("mes", null, null, [`calculating ${time_to_calculate} sec. in ${no_needed_steps} steps.`]);

  // reset the datalogger
  let total_step_execution_time = 0;
  if (model_definition) {
    for (let step = 0; step < no_needed_steps; step++) {
      // do the model step and increase the execution time as the modelstep returns the execution time
      total_step_execution_time += modelStep();
    }

    // calculate the performance metrics
    let average_model_step_time = (total_step_execution_time / no_needed_steps) * 1000;

    // send messages containing the performance metrics
    sendMessage("mes", null, null, [`ready in ${total_step_execution_time.toFixed(3)} sec.`]);
    sendMessage("mes", null, null, [`avg model step in ${average_model_step_time.toFixed(3)} ms.`]);
  }
  
  // send the data object
  datalogger.sendData();
  
  // stop the model which clears all timers 
  stopModel()

  // console.log(total_volume)
};

// calculate a number of seconds of the model without storing data
const fastForwardModel = function (time_to_calculate) {

  // calculate the number of steps needed for the time_to_calculate
  let no_needed_steps = parseInt(time_to_calculate / current_model.modeling_stepsize);

  // send starting messages for this model run
  sendMessage("mes", null, null, ['fast forwarding']);
  sendMessage("mes", null, null, [`calculating ${time_to_calculate} sec. in ${no_needed_steps} steps.`]);


  if (model_definition) {
    for (let step = 0; step < no_needed_steps; step++) {
      // do the model step and increase the execution time as the modelstep returns the execution time
      modelStepFastForward();
    }

    // send messages containing the performance metrics
    sendMessage("mes", null, null, ['fast forward ready']);
    sendMessage("mes", null, null, [`model clock at ${Math.round(current_model.model_time_total)} sec.`]);
  }
  
  // signal model is ready
  sendMessage("mes", null, null, ['ready']);
};

// start the realtime model
const startModel = function () {
  if (model_definition) {
    // first switch on datalogger realtime mode
     datalogger.realtime = true;

    // reset the main timer if it's already running
    if (main_timer) {
      clearInterval(main_timer)
      clearTimeout(main_timer)
    }

    // set the main timer to the modeling interval which is stored in the JSON model definition
    main_timer = setInterval(modelStepRealtime, realtime_step * 1000);

    // notify main that the model is started
    sendMessage("mes", null, null, ["started"]);
  } 
};

// stop the realtime model
const stopModel = function () {

  if (model_definition) {
    // stop the main timer
    if (main_timer) {
      clearInterval(main_timer);
      clearTimeout(main_timer)
    }
    main_timer = null
    // notify UI that the model has stopped
    sendMessage("mes", null, null, [`stopped at ${Math.round(current_model.model_time_total)} seconds.`]);
  
    // signal model is ready
    sendMessage("mes", null, null, ['ready']);
  } 
};

// model cycle loop which is called every x ms defined by the modeling stepsize in the model definition
const modelStep = function () {

  // model performance calculation start point
  let t0 = performance.now();

  // iterate over all components and do the modelstep. The actual modeling is done in this loop

  for (const key in current_model.components) {
    current_model.components[key].modelStep();
    // if (current_model.components[key].subtype === 'BloodCompartment') {
    //   total_volume += current_model.components[key].vol
    // }
  }


  // update the intervention engine
  interventions.modelStep(current_model.model_time_total);

  // update the datalogger and inject the annotations from the interventions object
  datalogger.modelStep(current_model.model_time_total, interventions.getAnnotations());

  // process the annotations in the datalogger
  if (datalogger.annotations_processed) {
    // if all annotations are processed by the datalogger clear them from the interventions object
    datalogger.annotations_processed = false;
    interventions.clearAnnotations();
  }

  // increase the current modeltime
  current_model.model_time_total += current_model.modeling_stepsize;

  // calculate the model performance -> meaning how long did this model step take in ms
  return (performance.now() - t0) / 1000;

};

// realtime model cycle is called every x ms defined by the modeling stepsize in the model definition
const modelStepRealtime = function () {
  // this realtime model step has the purpose to calculate a model step in realtime, log the data and process interventions

   // model performance calculation start point
   let t0 = performance.now();

   // number of loops
   let no_loops = parseInt(realtime_step / current_model.modeling_stepsize);

   for (let i=0; i<no_loops; i++) {
     
     // iterate over all components and do the modelstep. The actual modeling is done in this loop
      for (const key in current_model.components) {
        current_model.components[key].modelStep();
      }
    
      // update the intervention engine
      interventions.modelStep(current_model.model_time_total);
    
       // update the datalogger and inject the annotations from the interventions object
       datalogger.modelStepRealtime(current_model.model_time_total, interventions.getAnnotations());
       
      // process the annotations in the datalogger
      if (datalogger.annotations_processed) {
        // if all annotations are processed by the datalogger clear them from the interventions object
        datalogger.annotations_processed = false;
        interventions.clearAnnotations();
      }
      // increase the current modeltime
      current_model.model_time_total += current_model.modeling_stepsize;     
   }


   // calculate the model performance -> meaning how long did this model step take in ms
   return (performance.now() - t0) / 1000;

}

// fast forward model cycle is called every x ms defined by the modeling stepsize in the model definition but does not store data
const modelStepFastForward = function () {
  // this fast forward step has the purpose of fast forwarding the model in time without doing any datalogging or intervention processing 
  // this function is realluy fast and can be used to jump to a period in the future of the model

   // iterate over all components and do the modelstep. The actual modeling is done in this loop
   for (const key in current_model.components) {
     current_model.components[key].modelStep();
   }
 
   // increase the current modeltime
   current_model.model_time_total += current_model.modeling_stepsize;
 

}

