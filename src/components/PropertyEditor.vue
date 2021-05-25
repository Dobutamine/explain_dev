<template>
  <q-card class="q-pb-sm q-pt-es q-ma-sm" bordered>

    <div v-if="isEnabled && !newComponentMode" class="q-mt-md">
      <div class="row q-mt-sm">
        <q-select class="col" v-model="selectedComponentName" :value="selectedComponentName" :options="modelList" @input="selectNewModelFromOutside" filled dense square label="selected model" style="width: 100%" />
      </div>
    </div>

   <div v-if="isEnabled && newComponentMode && !propsFound" class="row q-mt-es q-ml-md q-mr-sm q-mb-md">
    <q-select :options="componentCategories" class="col q-mr-sm" v-model="newComponentSelectedCategory" @input="newComponentCategorySelected" label="select component category">
    </q-select>
  </div>

   <div v-if="isEnabled && newComponentMode && !propsFound && !configureComponentMode" class="row q-ma-md q-mt-sm">
        <q-btn class="col q-mr-sm" dense color="negative" @click="returnToStart">
          <q-icon name="cancel" class="text-white" style="font-size: 1rem;" />
        </q-btn>
  </div>

  <div v-if="isEnabled && configureComponentMode && !propsFound" class="row q-ma-es q-mt-sm">

      <div  class="row q-col-gutter-x-md q-ma-sm" >
          <div v-for="(field, index) in newComponentProps" :key='index'>
            <q-input v-if="field.type === 'string'" class="text-caption" :label="field.name" v-model="field.value" @input="changeProperties($event, field.name)"></q-input>
            <q-input v-if="field.type === 'number'" type="number" class="text-caption" :label="field.name" v-model="field.value" @input="changeProperties($event, field.name)" ></q-input>
            <q-toggle v-if="field.type === 'boolean'" class="text-caption q-pt-lg" color="teal-10" size="sm"  :label="field.name" @input="changeProperties($event, field.name)" left-label v-model="field.value"/>
          </div>
      </div>
  </div>

<div v-if="isEnabled && configureComponentMode && !propsFound" class="row q-ma-md q-mt-sm">
        <q-btn class="col q-mr-sm" dense color="negative" @click="returnToStart">
          <q-icon name="cancel" class="text-white" style="font-size: 1rem;" />
        </q-btn>
        <q-btn class="col q-mr-sm" dense color="teal-10">
          <q-icon name="add_to_queue" class="text-white" style="font-size: 1rem;" />
        </q-btn>
  </div>

        <div class="q-ma-sm q-gutter row" >
          <div v-for="(field, index) in selectedComponentPropertyList" :key='index'>
            <q-input v-if="field.type === 'string'" readonly dense stack-label autogrow style="max-width: 90px"  squared class="q-mr-xs q-mb-xs text-caption" :label="field.name" v-model="field.value" @input="changeProperties($event, field.name)"></q-input>
          </div>
        </div>
        <div class="q-ma-sm q-gutter row" >
          <div v-for="(field, index) in selectedComponentPropertyList" :key='index'>
            <q-input v-if="field.type === 'number'" filled dense squared stack-label style="max-width: 90px" type="number" class="q-mr-xs q-mb-xs text-caption" :label="field.name" v-model="field.value" @input="changeProperties($event, field.name)"></q-input>
          </div>
        </div>
        <div class="q-ma-sm q-gutter row" >
          <div v-for="(field, index) in selectedComponentPropertyList" :key='index'>
              <q-checkbox v-if="field.type === 'boolean'" filled dense  class="text-caption q-pa-sm" color="teal-10" size="sm" label-color="red-10" :label="field.name" v-model="field.value" @input="changeProperties($event, field.name)"/>
          </div>
        </div>

    <div v-if="isEnabled && propsFound" class="row q-ma-sm q-mt-sm">
        <q-btn class="col q-mr-sm" dense color="negative" @click="returnToStart">
          <q-icon name="cancel" class="text-white" style="font-size: 1rem;" />
        </q-btn>
         <q-btn class="col q-mr-sm" dense color="teal-7" @click="submitChange">
          <q-icon name="done" class="text-white" style="font-size: 1rem;" />
        </q-btn>
    </div>

  </q-card>
</template>

<script>
export default {
  data () {
    return {
      isEnabled: true,
      newComponentMode: false,
      configureComponentMode: false,
      newComponentSelectedCategory: '',
      componentCategories: ['blood_compartment', 'blood_connector', 'gas_compartment', 'gas_connector', 'valve', 'container', 'diffusor', 'exchanger'],
      newComponentProps: [],
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
                break
              case 'model_definition':
                this.model_definition = message.data.data
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
    submitChange () {
      this.selectedComponentPropertyList.forEach(prop => {
        if (prop.changed) {
          this.$model.setPropertyDirect(this.selectedComponentName, prop.name, prop.value)
        }
      })
    },
    changeProperties (event, name) {
      this.selectedComponentPropertyList.forEach(prop => {
        if (prop.name === name) {
          prop.changed = true
        }
      })
    },
    returnToStart () {
      this.propsFound = false
      this.newComponentMode = false
      this.configureComponentMode = false
      this.selectedComponentName = ''
      this.$model.getProperties(null)
      this.getModelDefinition()
    },
    buildNewComponent () {
      this.newComponentMode = true
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
      const present = (element) => element[property] !== undefined
      return this.model_definition.components.some(present)
    },
    selectNewModelFromOutside (model) {
      this.selectedComponentName = model
      this.selectedComponentPropertyList = []

      // first find all strings
      Object.keys(this.properties[model]).forEach(property => {
        if (typeof this.properties[model][property] === 'string' && property !== 'name' && property !== 'type' && property !== 'subtype') {
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
