<template>
  <q-card class="q-pb-es q-pt-es q-ma-sm" bordered>

    <div class="q-mt-es row gutter text-overline" @click="isEnabled = !isEnabled">
        rust model interface
    </div>

    <div class="q-mt-es row gutter text-overline" @click="isEnabled = !isEnabled">
        <q-btn @click='testButtonPress'>TEST</q-btn>
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
      prevTime: 0
    }
  },
  mounted () {
    // listen for a force update message
    // this.$root.$on('forceupdate', this.forceUpdate)
    // attach an event listener to the model engine
    // this.attachEventListener()
  },
  beforeDestroy () {
    // clean up
    // this.$root.$off('forceupdate')
    // delete this.modelEventListener
  },
  methods: {
    testButtonPress () {
      const json = JSON.stringify(this.$model.definition)
      this.$rust.loadModeldefinition(json)
    },
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
      }
    },
    updateMonitor (data) {
      const size = data.length - 1
      if (data[size].time - this.prevTime > this.updateFreq) {
        this.prevTime = data[size].time
        this.parameters = data[size].Monitor.parameters
      }
    }
  }
}
</script>

<style>

</style>
