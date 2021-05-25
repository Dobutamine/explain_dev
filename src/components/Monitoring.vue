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
      prevTime: 0
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
                  this.updateMonitor(message.data.data[message.data.data.length - 1])
                }
                break
              default:
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
    updateMonitor (data) {
      if (data.time - this.prevTime > this.updateFreq) {
        this.prevTime = data.time
        this.parameters = data.Monitor.parameters
      }
    }
  }
}
</script>

<style>

</style>
