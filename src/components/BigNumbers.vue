<template>
  <q-card class="q-ma-sm q-pa-sm" bordered>
        <div class="col text-green-13">
          heartrate (bpm)
        </div>
        <div class="col text-h2 text-green-13">
          {{ heartrate }}
        </div>
        <div class="col text-cyan-13">
          sat pre/post (%)
        </div>
         <div class="col text-h2 text-cyan-13">
          {{ sao2_pre }}/{{ sao2_post }}
        </div>
         <div class="col text-red-13">
          abp (mmHg)
        </div>
         <div class="col text-h3 text-red-13">
          {{ abp }}
        </div>
        <div class="col">
          resp rate
        </div>
        <div class="col text-h2">
          {{ resp_rate }}
        </div>
        <div class="col text-yellow-13">
          etco2
        </div>
         <div class="col text-h2 text-yellow-13">
          {{ etco2 }}
        </div>
        <div class="col text-green-13">
          temp
        </div>
         <div class="col text-h2 text-green-13">
          {{ temp }}
        </div>
        <div class="col text-green-13">
          svo2 (svc / ivc)
        </div>
         <div class="col text-h2 text-green-13">
          {{ svo2_svc }} / {{ svo2_ivc }}
        </div>
  </q-card>
</template>

<script>
/* eslint-disable */
export default {
  data () {
    return {
      isEnabled: true,
      modelEventListener: null,
      heartrate: '-',
      abp: '-/-',
      pap: '-/-',
      cvp: '-',
      sao2_pre: '-',
      sao2_post: '-',
      svo2_ivc: '-',
      svo2_svc: '-',
      resp_rate: '-',
      etco2: '-',
      temp: '-',
      updateFreq: 1,
      prevTime: 0
    }
  },
  mounted () {
    this.$root.$on('forceupdate', this.forceUpdate)
    this.buildEventListener()
  },
  beforeDestroy () {
    this.$root.$off('forceupdate')
    delete this.modelEventListener
  },
  methods: {
    forceUpdate () {
      // force a rerender of this component 
      this.$forceUpdate()
      // delete the previous model event listener
      delete this.modelEventListener
      // start a new  model event listener
      this.buildEventListener()
    },
    buildEventListener () {
      this.modelEventListener = this.$model.engine.addEventListener('message', (message) => {
        switch (message.data.type) {
          case 'data':
            switch (message.data.target) {
              case 'datalogger_output':
                if (this.isEnabled) {
                  this.updateMonitor(message.data.data[message.data.data.length - 1])
                }         
                break
            }
            break
          case 'rt':
            if (this.isEnabled) {
              this.updateMonitor(message.data.data[0])
            }
            break
        }
      })
    },
    toggleIsEnabled () {
      this.isEnabled = !this.isEnabled
    },
    updateMonitor (data) {
      if (data.time - this.prevTime > this.updateFreq) {
        this.prevTime = data.time
        data.Monitor.parameters.forEach(parameter => {
          this[parameter.label] = parameter.result
        });
      }     
    }
  }

}
</script>

<style>

</style>
