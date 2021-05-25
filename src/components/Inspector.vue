<template>
  <q-card class="q-pb-sm q-pt-es q-ma-sm" bordered>

    <div v-if="isEnabled" class="q-mt-md">
      <div class="row q-mt-sm">
        <q-select class="col" v-model="selectedComponentName" :value="selectedComponentName" :options="modelList" @input="selectNewModelFromOutside" filled dense square label="selected component" style="width: 100%" />
      </div>
    </div>
        <div class="q-ma-sm q-gutter row" >
          <div v-for="(field, index) in selectedComponentPropertyList" :key='index'>
            <q-input v-if="field.type === 'number'" readonly filled dense squared stack-label style="max-width: 90px" type="number" class="q-mr-xs q-mb-xs text-caption" :label="field.name" v-model="field.value" @input="changeProperties($event, field.name)"></q-input>
          </div>
        </div>
        <div class="q-ma-sm q-gutter row" >
          <div v-for="(field, index) in selectedComponentPropertyList" :key='index'>
              <q-checkbox v-if="field.type === 'boolean'" readonly filled dense  class="text-caption q-pa-sm" color="teal-10" size="sm" label-color="red-10" :label="field.name" v-model="field.value" @input="changeProperties($event, field.name)"/>
          </div>
        </div>
        <div class="q-ma-sm q-gutter row" >
          <div v-for="(field, index) in selectedComponentPropertyList" :key='index'>
            <q-input v-if="field.type === 'string'" readonly dense stack-label autogrow style="max-width: 90px"  squared class="q-mr-xs q-mb-xs text-caption" :label="field.name" v-model="field.value" @input="changeProperties($event, field.name)"></q-input>
          </div>
        </div>
  </q-card>
</template>

<script>
export default {
  data () {
    return {
      isEnabled: true,
      modelEventListener: null,
      properties: null,
      standard: 0,
      value: 0,
      propsFound: false,
      model_definition: null,
      selectedComponentName: '',
      selectedComponentPropertyList: [],
      modelList: []

    }
  },
  mounted () {
    this.buildEventListener()

    this.$root.$on('add_to_graph1', (e) => { this.selectNewModelFromOutside(e) })
    this.$root.$on('show_selected_comp', (e) => { this.selectNewModelFromOutside(e) })
    this.$root.$on('forceupdate', this.forceUpdate)
    this.getModelDefinition()
    this.$model.getProperties(null)
  },
  beforeDestroy () {
    this.$root.$off('add_to_graph1')
    this.$root.$off('show_selected_comp')
    this.$root.$off('forceupdate')
    delete this.modelEventListener
  },
  methods: {
    forceUpdate (e) {
      this.$forceUpdate()
      delete this.modelEventListener
      // restart the event listener
      this.buildEventListener()
    },
    buildEventListener () {
      this.modelEventListener = this.$model.engine.addEventListener('message', (message) => {
        switch (message.data.type) {
          case 'data':
            switch (message.data.target) {
              case 'datalogger_output':
                this.$model.getProperties(null)
                break
              case 'props':
                this.properties = message.data.data
                this.createModelList()
                if (this.selectedComponentName) {
                  this.selectNewModelFromOutside(this.selectedComponentName)
                }
                break
            }
            break
        }
      })
    },
    toggleIsEnabled () {
      this.isEnabled = !this.isEnabled
      if (this.isEnabled) {
        this.$model.getProperties(null)
      }
    },
    returnToStart () {
      this.propsFound = false
      this.newComponentMode = false
      this.configureComponentMode = false
      this.selectedComponentName = ''
      this.$model.getProperties(null)
      this.getModelDefinition()
    },
    getModelDefinition () {
      this.$model.getModelDefinition(null)
    },
    createModelList () {
      this.modelList = []
      Object.keys(this.properties).forEach(property => {
        this.modelList.push(property)
      })
    },
    presentInModelDefinition (model, property) {
      return true
    },
    selectNewModelFromOutside (model) {
      this.selectedComponentName = model
      this.selectedComponentPropertyList = []

      // first find all strings
      Object.keys(this.properties[model]).forEach(property => {
        if (typeof this.properties[model][property] === 'string' && property !== 'name') {
          const prop = {
            name: property,
            value: this.properties[model][property],
            type: typeof this.properties[model][property]
          }
          // check whether it is present in the model definition file
          if (this.presentInModelDefinition(model, property)) {
            this.selectedComponentPropertyList.push(prop)
          }
        }
      })
      // second find all switched
      Object.keys(this.properties[model]).forEach(property => {
        if (typeof this.properties[model][property] === 'boolean') {
          const prop = {
            name: property,
            value: this.properties[model][property],
            type: typeof this.properties[model][property]
          }
          // check whether it is present in the model definition file
          if (this.presentInModelDefinition(model, property)) {
            this.selectedComponentPropertyList.push(prop)
          }
        }
      })
      // third find all number
      Object.keys(this.properties[model]).forEach(property => {
        if (typeof this.properties[model][property] === 'number') {
          const prop = {
            name: property,
            value: this.properties[model][property],
            type: typeof this.properties[model][property]
          }
          // check whether it is present in the model definition file
          if (this.presentInModelDefinition(model, property)) {
            this.selectedComponentPropertyList.push(prop)
          }
        }
      })
      this.propsFound = true
    }
  }

}
</script>

<style>

</style>
