import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Animated, Easing, ScrollView } from 'react-native'
import {initData, drawYAxis, drawHorizontalXAxisLabels, drawHorizontalYAxisLabels, drawHorizontalGuideLine, numberWithCommas, drawXAxis, drawXAxisLabels} from '../common'
import ColumnHorizontalChartItem from './column-horizontal-chart-item'

export default class ColumnHorizontalChart extends Component {
  constructor (props) {
    super(props)
    let defaultGap = this.props.defaultColumnMargin + 2 // columhHeight * serisCount + defaultMargin
    let newState = initData(this.props.data, this.props.width, defaultGap)
    this.state = {
      sortedData: newState.sortedData,
      max: newState.max,
      selectedIndex: null,
      fadeAnim: new Animated.Value(0),
      guideArray: newState.guideArray,
      gap: defaultGap
    }
    this.renderColumns = this.renderColumns.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(Object.assign({
        fadeAnim: new Animated.Value(0)
      }, initData(nextProps.data, this.props.width, this.state.gap)), () => {
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
    if (seriesCount <= 0) {
      return null
    }
    let standardSeries = seriesArray[0]
    let standardSeriesData = standardSeries.data
    let standardSeriesDataCount = standardSeriesData.length
    let renders = []
    for (let i = 0; i < standardSeriesDataCount; i++) {
      renders.push(<ColumnHorizontalChartItem key={i} seriesArray={seriesArray} dataIndex={i} defaultMargin={this.props.defaultColumnMargin} isLast={i === (standardSeriesDataCount - 1)} />)
    }
    return (
      <Animated.View style={{width: '100%', transform: [{scaleY: fadeAnim}]}}>
        {renders}
      </Animated.View>
    )
  }

  render () {
    let {fadeAnim} = this.state
    if (this.state.sortedData && this.state.sortedData.length === 0) {
      return null
    }
    console.log(this.state.sortedData)
    return (
      <View style={{width: this.props.width + 20}}>
        <ScrollView style={{height: this.props.height}}>
          <View style={{flexDirection: 'row'}}>
            {drawYAxis()}
            {drawHorizontalGuideLine(this.state.guideArray)}
            { /* drawHorizontalXAxisLabels(this.state.sortedData[0].data, this.state.gap) */ }
            <View style={{width: '100%'}}>
              <View style={{
                flexDirection: 'column',
                justifyContent: 'flex-start'
              }}>
                {this.renderColumns(fadeAnim)}
              </View>
            </View>
          </View>
        </ScrollView>
        {drawXAxis()}
        {drawHorizontalYAxisLabels(this.state.guideArray, this.props.width + 20)}
      </View>
    )
  }
}

ColumnHorizontalChart.propTypes = {
  data: PropTypes.array
}
ColumnHorizontalChart.defaultProps = {
  data: [],
  height: 150,
  width: 200,
  defaultColumnWidth: 40,
  defaultColumnMargin: 20,
  primaryColor: '#297AB1',
  highlightColor: '#FFFFFF'
}
