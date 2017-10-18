import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Animated, ScrollView, Easing, Text } from 'react-native'
import ColumnChartItem from './column-chart-item'
import {initData, drawYAxis, drawGuideText, drawGuideLine, numberWithCommas, drawXAxis, drawLabels} from '../common'

export default class ColumnChart extends Component {
  constructor (props) {
    super(props)
    let defaultGap = this.props.defaultColumnWidth + this.props.defaultColumnMargin
    let newState = initData(this.props.data, this.props.height, defaultGap)
    this.state = {
      sortedData: newState.sortedData,
      max: newState.max,
      selectedIndex: null,
      columnWidth: 0,
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
    Animated.timing(this.state.fadeAnim, { toValue: 1, easing: Easing.bounce, duration: 1000, useNativeDriver: true }).start()
  }

  renderColumns () {
    return this.state.sortedData.map((value, i) => {
      return (
        <ColumnChartItem key={i} value={value[1]}
          defaultWidth={this.props.defaultColumnWidth}
          defaultMargin={this.props.defaultColumnMargin}
          primaryColor={this.props.primaryColor}
          onClick={(evt) => this.handleClick(evt, i)} />
      )
    })
  }

  handleClick (event, index) {
    this.setState({
      selectedIndex: index
    })
  }
  drawTooltip (index) {
    if (typeof (this.state.selectedIndex) === 'number' && this.state.selectedIndex >= 0) {
      if (!this.state.sortedData[index]) {
        return null
      }
      // var bottom = this.state.sortedData[index][1]
      var left = this.state.sortedData[index][0]// this.state.sortedData[index][0] - width / 2 + 1
      return (
        <View style={[styles.tooltip, {position: 'absolute', left: left, height: this.state.sortedData[index][3] ? 60 : 30}]}>
          {this.state.sortedData[index][3] ? (<Text style={{fontWeight: 'bold'}}>{this.state.sortedData[index][3]}</Text>) : null}
          <Text>{numberWithCommas(this.state.sortedData[index][2], false)}</Text>
        </View>
      )
    } else {
      return null
    }
  }

  render () {
    let {fadeAnim} = this.state
    return (
      <View style={{flexDirection: 'row'}}>
        <View style={{paddingRight: 5}}>
          {drawGuideText(this.state.guideArray, this.props.height + 20)}
        </View>
        <View style={styles.mainContainer}>
          <ScrollView horizontal>
            <View>
              <View ref='chartView' style={styles.chartContainer}>
                {drawYAxis()}
                {drawGuideLine(this.state.guideArray)}
                <Animated.View style={[styles.chartView, {transform: [{scaleY: fadeAnim}]}]}>
                  {this.renderColumns()}
                </Animated.View>
              </View>
              {this.drawTooltip(this.state.selectedIndex)}
              {drawXAxis()}
              {drawLabels(this.state.sortedData, this.state.gap)}
            </View>
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
    paddingRight: 0
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
    height: '100%'
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderColor: '#AAAAAA',
    borderWidth: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center'
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
