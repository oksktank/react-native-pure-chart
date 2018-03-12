import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Animated, Easing } from 'react-native'
import {initData} from '../common'
import ColumnHorizontalChartItem from './column-horizontal-chart-item'

export default class ColumnHorizontalChart extends Component {
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

  render () {
    console.log('render: ', this.state.sortedData)
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
      renders.push(<ColumnHorizontalChartItem key={i} seriesArray={seriesArray} dataIndex={i} />)
    }

    return (
      <View style={{height: 200, borderWidth: 1, borderColor: 'black'}}>
        <View style={{
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}>
          {renders}
        </View>
      </View>
    )
  }
}

ColumnHorizontalChart.propTypes = {
  data: PropTypes.array
}
ColumnHorizontalChart.defaultProps = {
  data: [],
  height: 100,
  defaultColumnWidth: 40,
  defaultColumnMargin: 20,
  primaryColor: '#297AB1',
  highlightColor: '#FFFFFF'
}
