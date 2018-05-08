import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Animated, Easing, ScrollView, Text } from 'react-native'
import {initData, drawHorizontalXAxisLabels, drawHorizontalYAxisLabels, drawGuideLine, numberWithCommas, drawXAxis, drawXAxisLabels} from '../common'
import ColumnHorizontalChartItem from './column-horizontal-chart-item'

export default class ColumnHorizontalChart extends Component {
  constructor (props) {
    super(props)
    console.log('constructor')
    let defaultGap = this.props.defaultColumnWidth + this.props.defaultColumnMargin
    let newState = initData(this.props.data, this.props.width, defaultGap)
    this.state = {
      sortedData: newState.sortedData,
      max: newState.max,
      selectedIndex: null,
      fadeAnim: new Animated.Value(0),
      guideArray: newState.guideArray,
      gap: defaultGap
    }
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

  render () {
    let {fadeAnim} = this.state
    if (this.state.sortedData && this.state.sortedData.length === 0) return null

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
      console.log('i=', i, ', data=', seriesArray)
      renders.push(<ColumnHorizontalChartItem key={i} seriesArray={seriesArray} dataIndex={i} defaultMargin={this.props.defaultColumnMargin} isLast={i === (standardSeriesDataCount - 1)} />)
    }
    console.log('guidArray : ', this.state.guideArray)
    return (
      <Animated.View style={{width: this.props.width, height: this.props.height, borderWidth: 0, borderColor: 'black', transform: [{scaleY: fadeAnim}]}}>
        <ScrollView>
          <View style={{flexDirection: 'row'}}>
            {drawHorizontalYAxisLabels(this.state.sortedData[0].data, this.state.gap)}
            <View style={{width: '100%', borderWidth: 1, borderColor: 'red'}}>
              <View style={{
                flexDirection: 'column',
                justifyContent: 'flex-start'
              }} onLayout={(event) => {
                const {x, y, height, width} = event.nativeEvent.layout
                console.log('#####', x, y, height, width)
              }}>
                {renders}
              </View>
            </View>
          </View>
        </ScrollView>
        {drawHorizontalXAxisLabels(this.state.guideArray, this.props.width + 20)}
      </Animated.View>
    )
  }
}

ColumnHorizontalChart.propTypes = {
  data: PropTypes.array
}
ColumnHorizontalChart.defaultProps = {
  data: [],
  height: 150,
  width: 300,
  defaultColumnWidth: 40,
  defaultColumnMargin: 20,
  primaryColor: '#297AB1',
  highlightColor: '#FFFFFF'
}
