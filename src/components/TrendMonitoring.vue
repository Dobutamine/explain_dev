<template>
  <q-card class="q-pb-es q-pt-es q-ma-sm" bordered>

    <div class="q-mt-es row gutter text-overline" @click="isEnabled = !isEnabled">
        monitoring
    </div>

    <div v-if="(parameters.length > 0) && isEnabled">
      <div class="q-ma-sm q-gutter-xs row  items-center">
        <div v-for="(field, index) in parameters" :key='index'>
          <q-input v-model="field.result" filled readonly dense stack-label style="max-width: 90px" squared :label="field.label" />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
export default {
  data () {
    return {
      isEnabled: true,
      initialized: false,
      modelEventListener: null,
      parameters: [],
      updateFreq: 1,
      prevTime: 0,
      monitorStorageTime: 60,
      monitorMemory: [],
      monitorMemoryTime: 0
    }
  },
  mounted () {
    // listen for a force update message
    this.$root.$on('forceupdate', this.forceUpdate)
    // attach an event listener to the model engine
    this.attachEventListener()
  },
  beforeDestroy () {
    // clean up
    this.$root.$off('forceupdate')
    delete this.modelEventListener
  },
  methods: {
    forceUpdate (e) {
      // force this component to rebuild
      this.$forceUpdate()
      // remove the model event listener
      delete this.modelEventListener
      // restart a new model event listener
      this.attachEventListener()
    },
    attachEventListener () {
      this.modelEventListener = this.$model.engine.addEventListener('message', (message) => {
        switch (message.data.type) {
          case 'data':
            switch (message.data.target) {
              case 'datalogger_output':
                if (this.isEnabled) {
                  this.updateMonitor(message.data.data)
                }
                break
              default:
                break
            }
            break
          case 'rt':
            if (this.isEnabled) {
              this.updateMonitorRT(message.data.data)
            }
            break
        }
      })
    },
    updateMonitorRT (data) {
      if (data[0].time - this.prevTime > this.updateFreq) {
        this.prevTime = data[0].time
        this.parameters = data[0].Monitor.parameters

        this.monitorMemory.push({ time: data[0].time, data: data[0].Monitor.parameters })
      }
    },
    updateMonitor (data) {
      const size = data.length - 1
      this.processMonitorMemory(data)
      if (data[size].time - this.prevTime > this.updateFreq) {
        this.prevTime = data[size].time
        this.parameters = data[size].Monitor.parameters
      }
    },
    processMonitorMemory (data) {
      // build monitor memory with 1 second data numericals
      // check what the stepsize is (mostly 0.015 ms)
      const duration = (data[data.length - 1].time - data[0].time) / (data.length - 1)
      // calculate how may times the stepsize fits in 1 seconds
      const stepper = parseInt(1 / duration)
      // build the memory array with 1 second steps
      for (let index = 0; index < data.length - 1; index += stepper) {
        this.monitorMemory.push({ time: data[index].time, data: data[index].Monitor.parameters })
      }
      console.log(this.monitorMemory)
    },
    resetMemory () {
      this.monitorMemory = []
    }
  }
}
</script>

<style>

</style>
