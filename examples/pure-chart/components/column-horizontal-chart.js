import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Text, Animated, Easing, ScrollView } from 'react-native'
import {initData, drawYAxis, drawHorizontalYAxisLabels, drawHorizontalGuideLine, drawXAxis, numberWithCommas} from '../common'
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
    this.handleClick = this.handleClick.bind(this)
    this.drawTooltip = this.drawTooltip.bind(this)
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
      renders.push(<ColumnHorizontalChartItem key={i}
        seriesArray={seriesArray} dataIndex={i} defaultMargin={this.props.defaultColumnMargin} isLast={i === (standardSeriesDataCount - 1)}
        onClick={(evt) => this.handleClick(evt, i)} />)
    }
    return (
      <Animated.View style={{width: '100%', transform: [{scaleX: fadeAnim}]}}>
        {renders}
      </Animated.View>
    )
  }

  handleClick (event, index) {
    console.log('click event : ', index)
    this.setState({
      selectedIndex: index
    })
  }

  drawTooltip (selectedIndex) {
    if (typeof (selectedIndex) === 'number' && selectedIndex >= 0) {
      let standardSeries = this.state.sortedData[0]
      if (!standardSeries) {
        return null
      }
      /*
      let seriesCount = this.state.sortedData.length
      let plusGap = 10 * seriesCount
      if (selectedIndex === standardSeries.data.length - 1) {
        plusGap = -50
      }
      // 차트 width를 마지막에 늘려야겠음.
      */
      let plusGap = 0
      /**
       * Position 조정이 필요함
       */
      let position = standardSeries.data[selectedIndex]['gap'] + plusGap
      let tooltipRenders = []
      for (let i = 0; i < this.state.sortedData.length; i++) {
        let series = this.state.sortedData[i]
        if (series.data[selectedIndex]['x']) {
          tooltipRenders.push(<Text key={'tooltipTitle-' + i} style={styles.tooltipTitle}>{series.data[selectedIndex]['x']}</Text>)
        }
        tooltipRenders.push(
          <View key={'tooltipText-' + i} style={{flexDirection: 'row', paddingLeft: 5, alignItems: 'center'}}>
            <View style={[styles.tooltipColor, {backgroundColor: !series.seriesColor ? this.props.primaryColor : series.seriesColor}]} />
            <Text style={styles.tooltipValue}>{numberWithCommas(series.data[selectedIndex]['y'], false)}</Text>
          </View>
        )
      }
      return (
        <View style={[styles.tooltipWrapper, { left: this.props.width/2, top: position}]}>
          <View style={styles.tooltip}>
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
    if (this.state.sortedData && this.state.sortedData.length === 0) {
      return null
    }
    console.log(this.state.sortedData)
    return (
      <View style={{width: this.props.width + 20}}>
        <ScrollView style={{height: this.props.height}}>
          <View>
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
          </View>
          {this.drawTooltip(this.state.selectedIndex)}
        </ScrollView>
        {drawXAxis()}
        {drawHorizontalYAxisLabels(this.state.guideArray, this.props.width + 20)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF'
  },
  tooltipWrapper: {
    position: 'absolute',
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderColor: '#AAAAAA',
    borderWidth: 1,
    padding: 3,
    alignItems: 'flex-start',
    justifyContent: 'center',
    opacity: 0.8,
  },
  tooltipTitle: {fontSize: 10},
  tooltipValue: {fontWeight: 'bold', fontSize: 15},
  tooltipColor: {
    width: 10,
    height: 5,
    marginRight: 3,
    borderRadius: 2
  }
})

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
