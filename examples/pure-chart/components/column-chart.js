import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Animated, ScrollView, Easing, Text, Dimensions } from 'react-native'
import ColumnChartItem from './column-chart-item'
import { initData, drawYAxis, drawYAxisLabels, drawGuideLine, numberWithCommas, drawXAxis, drawXAxisLabels } from '../common'
const deviceWidth = Dimensions.get('screen').width
export default class ColumnChart extends Component {
  constructor(props) {
    super(props)
    let defaultGap =  this.props.defaultColumnMargin
    let newState = initData(this.props.data, this.props.height, defaultGap, this.props.numberOfYAxisGuideLine)
    this.state = {
      sortedData: newState.sortedData,
      max: newState.max,
      selectedIndex: null,
      fadeAnim: new Animated.Value(0),
      guideArray: newState.guideArray,
      gap: defaultGap
    }

    this.scrollView = null

    this.renderColumns = this.renderColumns.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.drawTooltip = this.drawTooltip.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(Object.assign({
        fadeAnim: new Animated.Value(0)
      }, initData(nextProps.data, this.props.height, this.state.gap, this.props.numberOfYAxisGuideLine)), () => {
        Animated.timing(this.state.fadeAnim, { toValue: 1, easing: Easing.bounce, duration: 1000, useNativeDriver: true }).start()
      })
    }
  }

  componentDidUpdate(nextProps, nextState) {
    if (this.scrollView != null && nextState.max == 0) {
      setTimeout(
        () => this.scrollView.scrollTo(this.props.initialScrollPosition), this.props.initialScrollTimeOut
      )
    }
  }

  componentDidMount() {
    Animated.timing(this.state.fadeAnim, {
      toValue: 1, easing: Easing.bounce, duration: 1000, useNativeDriver: true
    }).start()
    if (this.scrollView != null) {
      setTimeout(
        () => this.scrollView.scrollTo(this.props.initialScrollPosition), this.props.initialScrollTimeOut
      )
    }

  }

  renderColumns(fadeAnim) {
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
            defaultHeight={this.props.height + 20}
            defaultMargin={this.props.defaultColumnMargin}
            defaultBorderColor={this.props.defaultBorderColor}
            isSelected={this.state.selectedIndex === i}
            highlightColor={this.props.highlightColor}
            onClick={(evt) => this.handleClick(evt, i)} />
        )
      }
    }
    return (
      <Animated.View style={[styles.chartView, {
        transform: [{ scaleY: fadeAnim }],
        marginBottom: this.props.minValue && this.state.guideArray && this.state.guideArray.length > 0 ? -1 * this.state.guideArray[0][2] * this.props.minValue : null
      }]}>
        {renderColumns}
      </Animated.View>
    )
  }

  handleClick(event, index) {
    this.setState({
      selectedIndex: index
    }, () => {
      if (typeof this.props.onPress === 'function') {
        this.props.onPress(index)
      }
    })
  }
  drawTooltip(selectedIndex) {
    if (typeof (selectedIndex) === 'number' && selectedIndex >= 0) {
      let standardSeries = this.state.sortedData[0]
      if (!standardSeries) {
        console.warn('standardSeries is null')
        return null
      }

      let seriesCount = this.state.sortedData.length
      let plusGap = 10 * seriesCount
      if (this.state.sortedData.length === 1) {
        plusGap = 0
      } else if (selectedIndex === standardSeries.data.length - 1) {
        plusGap = -50
      }
      // 차트 width를 마지막에 늘려야겠음.

      let left = standardSeries.data[selectedIndex]['gap'] + plusGap
      console.log('====================================');
      console.log('standardSeries', standardSeries, selectedIndex, this.props.defaultColumnWidth);
      console.log('====================================');
      let marginLeft = selectedIndex === 0 ? this.props.defaultColumnMargin : standardSeries.data[1]['gap']*(selectedIndex+1)

      let tooltipRenders = []
      for (let i = 0; i < this.state.sortedData.length; i++) {
        let series = this.state.sortedData[i]
        if (series.data[selectedIndex]['x']) {
          tooltipRenders.push(<Text key={'tooltipTitle-' + i} style={styles.tooltipTitle}>{series.data[selectedIndex]['x']}</Text>)
        }
        tooltipRenders.push(
          <View key={'tooltipText-' + i} style={{ flexDirection: 'row', paddingLeft: 5, alignItems: 'center' }}>
            <View style={[styles.tooltipColor, { backgroundColor: !series.seriesColor ? this.props.primaryColor : series.seriesColor }]} />
            <Text style={styles.tooltipValue}>{numberWithCommas(series.data[selectedIndex]['y'], false)}</Text>
          </View>
        )
      }
      return (
        <View style={[styles.tooltipWrapper, { left: marginLeft }]}>
          <View style={styles.tooltip}>
            {tooltipRenders}
          </View>
        </View>
      )
    } else {
      return null
    }
  }

  render() {
    let { fadeAnim } = this.state
    if (this.state.sortedData && this.state.sortedData.length === 0) return null

    return (
      <View style={StyleSheet.flatten([styles.wrapper, {
        backgroundColor: 'rgba(0,0,0,0)',
        
      }])}>
        <View style={{ paddingRight: 5 }}>
          {this.props.showYAxisLabel &&
            drawYAxisLabels(this.state.guideArray, this.props.height + 20, this.props.minValue, this.props.labelColor, this.props.yAxisSymbol)}
        </View>
        <View style={styles.mainContainer}>
          <ScrollView showsHorizontalScrollIndicator={false} ref={scrollView => this.scrollView = scrollView} horizontal>
            <View>
              <View ref='chartView' style={styles.chartContainer}>
                {drawYAxis(this.props.yAxisColor)}
                {drawGuideLine(this.state.guideArray, this.props.yAxisGridLineColor)}
                {this.renderColumns(fadeAnim)}
              </View>
              {drawXAxis(this.props.xAxisColor)}
              <View>
                {this.props.showXAxisLabel &&
                  drawXAxisLabels(this.state.sortedData[0].data, this.state.gap, this.props.labelColor, this.props.showEvenNumberXaxisLabel, this.props.defaultColumnWidth / 2 / 1.2)}
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
  wrapper: {
    flexDirection: 'row',
    overflow: 'hidden'
  },
  mainContainer: {
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    height: '100%',
    flexDirection: 'row',
    width: deviceWidth /1.2
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 0,
    paddingRight: 10,
    overflow: 'hidden',
    width: deviceWidth
  },
  chartView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%'
  },
  tooltipWrapper: {
    position: 'absolute',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderColor: '#AAAAAA',
    borderWidth: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8
  },
  tooltipTitle: { fontSize: 10 },
  tooltipValue: { fontWeight: 'bold', fontSize: 15 },
  tooltipColor: {
    width: 10,
    height: 5,
    marginRight: 3,
    borderRadius: 2
  }
})

ColumnChart.propTypes = {
  data: PropTypes.array
}
ColumnChart.defaultProps = {
  data: [],
  height: 100,
  defaultColumnWidth: 40,
  defaultColumnMargin: 20,
  defaultBorderColor: '#FFFFFF',
  primaryColor: '#297AB1',
  highlightColor: 'red',
  showEvenNumberXaxisLabel: true,
  initialScrollPosition: { x: 0, y: 0, animated: true },
  initialScrollTimeOut: 300,
  showYAxisLabel: true,
  showXAxisLabel: true,
  yAxisSymbol: ''
}
