import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Animated, ScrollView, Easing, Text } from 'react-native'
import ColumnChartItem from './column-chart-item'
import {initData, drawYAxis, drawYAxisLabels, drawGuideLine, numberWithCommas, drawXAxis, drawXAxisLabels} from '../common'

export default class ColumnChart extends Component {
  constructor (props) {
    super(props)
    let defaultGap = this.props.defaultColumnWidth + this.props.defaultColumnMargin
    let newState = initData(this.props.data, this.props.height, defaultGap)
    this.state = {
      sortedData: newState.sortedData,
      max: newState.max,
      selectedIndex: null,
      fadeAnim: new Animated.Value(0),
      guideArray: newState.guideArray,
      gap: defaultGap
    }
    this.renderColumns = this.renderColumns.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.drawTooltip = this.drawTooltip.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(Object.assign({
        fadeAnim: new Animated.Value(0)
      }, initData(nextProps.data, this.props.height, this.state.gap)), () => {
        Animated.timing(this.state.fadeAnim, { toValue: 1, easing: Easing.bounce, duration: 1000, useNativeDriver: true }).start()
      })
    }
  }

  componentDidMount () {
    Animated.timing(this.state.fadeAnim, {
      toValue: 1, easing: Easing.bounce, duration: 1000, useNativeDriver: true
    }).start()
  }

  renderColumns (fadeAnim) {
    let seriesArray = this.state.sortedData
    let seriesCount = seriesArray.length
    let renderColumns = []
    if (seriesCount > 0) {
      let standardSeries = seriesArray[0]
      let dataCount = standardSeries.data.length
      for (let i = 0; i < dataCount; i++) {
        renderColumns.push(
          <ColumnChartItem key={i} seriesArray={this.state.sortedData}
            dataIndex={i}
            defaultWidth={this.props.defaultColumnWidth}
            defaultMargin={this.props.defaultColumnMargin}
            onClick={(evt) => this.handleClick(evt, i)} />
        )
      }
    }
    return (
      <Animated.View style={[styles.chartView, {transform: [{scaleY: fadeAnim}]}]}>
        {renderColumns}
      </Animated.View>
    )
  }

  handleClick (event, index) {
    console.log('click!!', index)
    this.setState({
      selectedIndex: index
    })
  }
  drawTooltip (selectedIndex) {
    console.log('drawTooltip!!', selectedIndex)
    if (typeof (selectedIndex) === 'number' && selectedIndex >= 0) {
      let standardSeries = this.state.sortedData[0]
      if (!standardSeries) {
        console.warn('standardSeries is null')
        return null
      }
      let plusGap = 20
      if (selectedIndex === 0) {
        plusGap = 50
      } else if (selectedIndex === standardSeries.data.length - 1) {
        plusGap = -20
      }
      let left = standardSeries.data[selectedIndex]['gap'] + plusGap
      let tooltipRenders = []
      let tooltipHeight = 30
      let seriesCount = this.state.sortedData.length
      if (standardSeries.data[selectedIndex]['x']) {
        tooltipHeight = 40
      }
      tooltipHeight = tooltipHeight * seriesCount
      
      for (let i = 0; i < this.state.sortedData.length; i++) {
        let series = this.state.sortedData[i]
        if (series.data[selectedIndex]['x']) {
          tooltipRenders.push(<Text>{series.data[selectedIndex]['x']}</Text>)
        }
        tooltipRenders.push(<Text>{numberWithCommas(series.data[selectedIndex]['y'], false)}</Text>)
      }
      return (
        <View style={[styles.tooltipWrapper, { left: left }]}>
          <View style={[styles.tooltip, { height: tooltipHeight }]}>
            {tooltipRenders}
          </View>
        </View>
      )
    } else {
      return null
    }
  }

  render () {
    let {fadeAnim} = this.state
    if (this.state.sortedData && this.state.sortedData.length === 0) return null

    return (
      <View style={{flexDirection: 'row'}}>
        <View style={{paddingRight: 5}}>
          {drawYAxisLabels(this.state.guideArray, this.props.height + 20)}
        </View>
        <View style={styles.mainContainer}>
          <ScrollView horizontal>
            <View>
              <View ref='chartView' style={styles.chartContainer}>
                {drawYAxis()}
                {drawGuideLine(this.state.guideArray)}
                {this.renderColumns(fadeAnim)}
              </View>
              {drawXAxis()}
              <View style={{
                marginLeft: this.props.defaultColumnWidth / 2
              }}>

                {drawXAxisLabels(this.state.sortedData[0].data, this.state.gap)}
              </View>
            </View>
            {this.drawTooltip(this.state.selectedIndex)}
          </ScrollView>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    height: '100%'
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 0,
    paddingRight: 0
  },
  chartView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingTop: 20
  },
  tooltipWrapper: {
    position: 'absolute',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'black'
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderColor: '#AAAAAA',
    borderWidth: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
    position: 'absolute'
  }
})

ColumnChart.propTypes = {
  data: PropTypes.array
}
ColumnChart.defaultProps = {
  data: [],
  height: 100,
  defaultColumnWidth: 30,
  defaultColumnMargin: 20,
  primaryColor: '#297AB1'
}
