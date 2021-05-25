/* eslint-disable */

class Monitor { 
    constructor(_model) {
        this._model = _model;
        this._initialized = false

        this._timeCounter = 0
        this._updateCounter = 0
        this._updateFrequency = 1

        this._backup = false
        this._backupCounter = 0
        this._backupInterval = 5
    }

    modelStep() {
        if (this.is_enabled) {
          this.modelCycle();
        }
    }

    initializeMonitor () {
        this.parameters.forEach(parameter => {
            parameter['value'] = 0
            parameter['max'] = 0
            parameter['min'] = 0
            parameter['temp_max'] = -1000
            parameter['temp_min'] = 1000
            parameter['counter'] = 0
            parameter['stroke'] = 0
            parameter['flow'] = 0
            parameter['result'] = 0
        })
        this._initialized = true
    }
    removeFromMonitor (parameterLabel) {
        let foundIndex = -1
        this.parameters.forEach((parameter, index) => {
            if (parameter.label === parameterLabel) {
                foundIndex = index
            }
        })
    }

    addToMonitor (parameter) {

        /*
                "label": "lvo",
                "model": "LV_AA",
                "prop": "real_flow",
                "decimals": 3,
                "type": "flow"
        */
       
        parameter['value'] = 0
        parameter['max'] = 0
        parameter['min'] = 0
        parameter['temp_max'] = -1000
        parameter['temp_min'] = 1000
        parameter['counter'] = 0
        parameter['stroke'] = 0
        parameter['flow'] = 0
        parameter['result'] = 0

        this.parameters.push(parameter)
    }

    modelCycle () {
        if (!this._initialized) {
            this.initializeMonitor()
        }
        
        // evaluate parameters
        if (this._model.components.ECG.ncc_ventricular === 1 | this._backup) {
            this._backup = false
            this._backupCounter = 0
            
            this.parameters.forEach(parameter => {
                parameter.max = parameter.temp_max
                parameter.min = parameter.temp_min
                parameter.stroke = parameter.counter
                parameter.flow = (parameter.counter / this._timeCounter) * 60
                parameter.temp_max = -1000
                parameter.temp_min = 1000
                parameter.counter = 0
                switch (parameter.type) {
                    case "flow":
                        parameter.result = (parameter.flow * parameter.multiplier).toFixed(parameter.decimals)
                        break;
                    case "vital":
                        parameter.result = (parameter.value * parameter.multiplier).toFixed(parameter.decimals)
                        break;
                    case "stroke":
                        parameter.result = (parameter.stroke * parameter.multiplier).toFixed(parameter.decimals)
                        break;
                    case "range":
                        parameter.result = (parameter.max).toFixed(parameter.decimals) + "/" + (parameter.min).toFixed(parameter.decimals)
                        break;
                }
            })
            this._timeCounter = 0
        }

        // store the current values
        this.parameters.forEach(parameter => {
            parameter.value = this._model.components[parameter.model][parameter.prop]
            if (parameter.value > parameter.temp_max) {
                parameter.temp_max = parameter.value
            }
            if (parameter.value < parameter.temp_min) {
                parameter.temp_min = parameter.value
            }
            parameter.counter += parameter.value * this._model.modeling_stepsize
        })

        // if no ecg is running then we should use a backup counter
        if (this._backupCounter > this._backupInterval) {
            this._backup = true
            this._backupCounter = 0
        }

        // increase the counters
        this._backupCounter += this._model.modeling_stepsize
        this._timeCounter += this._model.modeling_stepsize

    }
}