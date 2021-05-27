<template>
    <q-card class="q-ma-sm" bordered>
        <div :id="chartId" :class="chartClass"></div>
    </q-card>
</template>

<script>
import { lightningChart, Themes, emptyFill, AutoCursorModes, FontSettings, SolidFill, ColorHEX, UIElementBuilders, AxisScrollStrategies, SolidLine, AxisTickStrategies } from '@arction/lcjs'

const lcjs = lightningChart()

export default {
  props: {
    chartId: {
      required: true,
      type: String
    }
  },
  data () {
    return {
      chartClass: 'rectangle',
      chart: null,
      chartLabel: null,
      chartXAxis: null,
      chartYAxis: null,
      chartDataSeries: [],
      chartDataValues: [],
      chartConfiguration: {
        width: '',
        height: '',
        theme: 'dark',
        font: 'Roboto, Arial, Helvetica, sans-serif',
        cursor: false,
        padding: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5
        },
        title: {
          caption: '',
          size: 10,
          style: 'normal',
          color: '#FFF',
          marginTop: 0,
          marginBottom: 0
        },
        label: {
          caption: 'ECG',
          size: 10,
          style: 'normal',
          color: '#FFF',
          xPos: 5,
          yPos: 80
        },
        xAxis: {
          anmimations: true,
          zoomEnabled: false,
          scrollingStrategy: 'numeric',
          intervalStart: 0,
          intervalEnd: 100,
          thickness: 2,
          color: '#F00',
          ticksEnabled: true,
          tickStrategy: 'numeric',
          majorTickSize: 10,
          minorTickSize: 8
        },
        yAxis: {
          anmimations: true,
          zoomEnabled: false,
          scrollingStrategy: 'fitting',
          intervalStart: 0,
          intervalEnd: 100,
          thickness: 2,
          color: '#F00',
          ticksEnabled: true,
          tickStrategy: 'numeric',
          majorTickSize: 10,
          minorTickSize: 8
        },
        dataHandling: {
          strategy: 'scrolling',
          maxDataPoints: 200000
        },
        dataSeries: {
          sources: [],
          offsets: [],
          multipliers: [],
          thickness: 2,
          colors: []
        }
      }
    }
  },
  methods: {
    updateChart () {

    },
    redrawChart () {

    },
    disposeChart () {

    },
    configureChart () {
      this.chart = lcjs.ChartXY({
        container: this.chartId,
        theme: Themes.dark
      })

      // general chartXY settings
      // padding
      this.chart.setPadding({ top: this.chartConfiguration.padding.top, bottom: this.chartConfiguration.padding.bottom, left: this.chartConfiguration.padding.left, right: this.chartConfiguration.padding.right })

      // cursor
      if (this.chartConfiguration.cursor) {
        this.chart.setAutoCursorMode(AutoCursorModes.snapToClosest)
      } else {
        this.chart.setAutoCursorMode(AutoCursorModes.disabled)
      }

      // chart title
      if (this.chartConfiguration.title.title === '') {
        this.chart.setTitleFillStyle(emptyFill)
      } else {
        this.chart.setTitle(this.chartConfiguration.title.caption)
        this.chart.setTitleFont(new FontSettings({
          size: this.chartConfiguration.title.size,
          family: this.chartConfiguration.font,
          style: this.chartConfiguration.title.style
        }))
        this.chart.setTitleFillStyle(new SolidFill({ color: ColorHEX(this.chartConfiguration.title.color) }))
        this.chart.setTitleMarginBottom(this.chartConfiguration.title.marginTop)
        this.chart.setTitleMarginBottom(this.chartConfiguration.title.marginBottom)
      }

      // chart label
      if (this.chartConfiguration.label.caption !== '') {
        this.chartLabel = this.chart.addUIElement(UIElementBuilders.TextBox)
        this.chartLabel.setText(this.chartConfiguration.label.caption)
        this.chartLabel.setPosition({ x: this.chartConfiguration.label.xPos, y: this.chartConfiguration.label.yPos })

        this.chartLabel.setFont(new FontSettings({
          size: this.chartConfiguration.label.size,
          family: this.chartConfiguration.font,
          style: this.chartConfiguration.label.style
        }))
        // label text color
        this.chartLabel.setTextFillStyle(new SolidFill({ color: ColorHEX(this.chartConfiguration.label.color) }))
      }

      // configure the x-axis
      this.chartXAxis = this.chart.getDefaultAxisX()
      // animations
      if (this.chartConfiguration.anmimations === false) {
        this.chartXAxis.disableAnimations()
      }
      // scrolling strategy
      switch (this.chartConfiguration.xAxis.scrollingStrategy) {
        case 'fitting': // Axis will constantly scroll to fit attached Series.
          this.chartXAxis.setScrollStrategy(AxisScrollStrategies.fitting)
          break
        case 'expansion': // Axis will scroll to fit Series that are out of view, but it won't shrink even if there is empty space (like "fitting" does).
          this.chartXAxis.setScrollStrategy(AxisScrollStrategies.expansion)
          break
        case 'progressive': // Axis will scroll to show new, progressive data, but will keep its interval constant - leaving older data out of view.
          this.chartXAxis.setScrollStrategy(AxisScrollStrategies.progressive)
          this.chartXAxis.setInterval(this.chartConfiguration.xAxis.intervalStart, this.chartConfiguration.xAxis.intervalEnd)
          break
        case 'regressive': // Axis will scroll to show new, regressive data, but will keep its interval constant - leaving older data out of view.
          this.chartXAxis.setScrollStrategy(AxisScrollStrategies.regressive)
          this.chartXAxis.setInterval(this.chartConfiguration.xAxis.intervalStart, this.chartConfiguration.xAxis.intervalEnd)
          break
      }
      // zooming
      if (this.chartConfiguration.xAxis.zoomEnabled === false) {
        this.chartXAxis.setAnimationZoom(undefined)
        this.chartXAxis.setAxisInteractionZoomByDragging(false)
        this.chartXAxis.setAxisInteractionZoomByWheeling(false)
        this.chartXAxis.setAxisInteractionPanByDragging(false)
      }
      // x-axis color and thickness
      this.chartXAxis.setStrokeStyle(new SolidLine({
        thickness: this.chartConfiguration.xAxis.thickness,
        fillStyle: new SolidFill({
          color: ColorHEX(this.chartConfiguration.xAxis.color)
        })
      }))
      // x-axis tick strategy
      if (this.chartConfiguration.xAxis.ticksEnabled) {
        switch (this.chartConfiguration.xAxis.tickStrategy) {
          case 'numeric':
            this.chartXAxis.setTickStrategy(AxisTickStrategies.Numeric)
            this.chartXAxis.setTickStyle((a) => a.setMajorTickStyle((b) => b.setLabelFont((font) => font.setSize(this.chartConfiguration.xAxis.majorTickSize))))
            this.chartXAxis.setTickStyle((a) => a.setMinorTickStyle((b) => b.setLabelFont((font) => font.setSize(this.chartConfiguration.xAxis.minorTickSize))))
            break
          case 'datetime':
            this.chartXAxis.setTickStrategy(AxisTickStrategies.DateTime)
            this.chartXAxis.setTickStrategy(AxisTickStrategies.Numeric)
            this.chartXAxis.setTickStyle((a) => a.setMajorTickStyle((b) => b.setLabelFont((font) => font.setSize(this.chartConfiguration.xAxis.majorTickSize))))
            this.chartXAxis.setTickStyle((a) => a.setMinorTickStyle((b) => b.setLabelFont((font) => font.setSize(this.chartConfiguration.xAxis.minorTickSize))))
            break
        }
      } else {
        this.chartXAxis.setTickStrategy(AxisTickStrategies.Empty)
      }

      // configure the y-axis
      this.chartYAxis = this.chart.getDefaultAxisY()
      // animations
      if (this.chartConfiguration.anmimations === false) {
        this.chartYAxis.disableAnimations()
      }
      // scrolling strategy
      switch (this.chartConfiguration.yAxis.scrollingStrategy) {
        case 'fitting': // Axis will constantly scroll to fit attached Series.
          this.chartYAxis.setScrollStrategy(AxisScrollStrategies.fitting)
          break
        case 'expansion': // Axis will scroll to fit Series that are out of view, but it won't shrink even if there is empty space (like "fitting" does).
          this.chartYAxis.setScrollStrategy(AxisScrollStrategies.expansion)
          break
        case 'progressive': // Axis will scroll to show new, progressive data, but will keep its interval constant - leaving older data out of view.
          this.chartYAxis.setScrollStrategy(AxisScrollStrategies.progressive)
          this.chartYAxis.setInterval(this.chartConfiguration.yAxis.intervalStart, this.chartConfiguration.yAxis.intervalEnd)
          break
        case 'regressive': // Axis will scroll to show new, regressive data, but will keep its interval constant - leaving older data out of view.
          this.chartYAxis.setScrollStrategy(AxisScrollStrategies.regressive)
          this.chartYAxis.setInterval(this.chartConfiguration.yAxis.intervalStart, this.chartConfiguration.yAxis.intervalEnd)
          break
      }
      // zooming
      if (this.chartConfiguration.yAxis.zoomEnabled === false) {
        this.chartYAxis.setAnimationZoom(undefined)
        this.chartYAxis.setAxisInteractionZoomByDragging(false)
        this.chartYAxis.setAxisInteractionZoomByWheeling(false)
        this.chartYAxis.setAxisInteractionPanByDragging(false)
      }
      // x-axis color and thickness
      this.chartYAxis.setStrokeStyle(new SolidLine({
        thickness: this.chartConfiguration.yAxis.thickness,
        fillStyle: new SolidFill({
          color: ColorHEX(this.chartConfiguration.yAxis.color)
        })
      }))
      // x-axis tick strategy
      const majorSize = this.chartConfiguration.yAxis.majorTickSize
      const minorSize = this.chartConfiguration.yAxis.minorTickSize
      if (this.chartConfiguration.yAxis.ticksEnabled) {
        switch (this.chartConfiguration.yAxis.tickStrategy) {
          case 'numeric':
            this.chartYAxis.setTickStrategy(AxisTickStrategies.Numeric)
            this.chartYAxis.setTickStyle((a) => a.setMajorTickStyle((b) => b.setLabelFont((font) => font.setSize(majorSize))))
            this.chartYAxis.setTickStyle((a) => a.setMinorTickStyle((b) => b.setLabelFont((font) => font.setSize(minorSize))))
            break
          case 'datetime':
            this.chartYAxis.setTickStrategy(AxisTickStrategies.DateTime)
            this.chartYAxis.setTickStrategy(AxisTickStrategies.Numeric)
            this.chartYAxis.setTickStyle((a) => a.setMajorTickStyle((b) => b.setLabelFont((font) => font.setSize(this.chartConfiguration.yAxis.majorTickSize))))
            this.chartYAxis.setTickStyle((a) => a.setMinorTickStyle((b) => b.setLabelFont((font) => font.setSize(this.chartConfiguration.yAxis.minorTickSize))))
            break
        }
      } else {
        this.chartYAxis.setTickStrategy(AxisTickStrategies.Empty)
      }
    }
  },
  mounted () {
    this.configureChart()
  },
  beforeMount () {},
  beforeDestroy () {},
  beforeCreate () {}
}
</script>

<style>
</style>
