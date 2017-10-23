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
    Animated.timing(this.state.fadeAnim, { toValue: 1, easing: Easing.bounce, duration: 1000, useNativeDriver: true }).start()
  }

  renderColumns () {
    return this.state.sortedData.map((value, i) => {
      return (
        <ColumnChartItem key={i} value={value[1]}
          defaultWidth={this.props.defaultColumnWidth}
          defaultMargin={this.props.defaultColumnMargin}
          primaryColor={this.state.selectedIndex === i ? 'red' : this.props.primaryColor}
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
      let width = 200

      let left = this.state.sortedData[index][0] + this.props.defaultColumnWidth / 2 - width / 2

      let marginLeft = 0
      if (index === 0) {
        left = this.state.sortedData[index + 1][0] + this.props.defaultColumnWidth / 2 - width / 2
      } else if (index === this.state.sortedData.length - 1) {
        left = this.state.sortedData[index - 1][0] + this.props.defaultColumnWidth / 2 - width / 2
      }
      return (
        <View style={{
          position: 'absolute',
          height: '100%',
          width: width,
          left: left,
          alignItems: 'center',
          marginLeft: marginLeft,
          justifyContent: 'center'
        }}>
          <View style={[
            styles.tooltip,
              {position: 'absolute', height: this.state.sortedData[index][3] ? 60 : 30}
          ]}>
            {this.state.sortedData[index][3] ? (<Text style={{fontWeight: 'bold'}}>{this.state.sortedData[index][3]}</Text>) : null}
            <Text>{numberWithCommas(this.state.sortedData[index][2], false)}</Text>
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
                <Animated.View style={[styles.chartView, {transform: [{scaleY: fadeAnim}]}]}>
                  {this.renderColumns()}
                </Animated.View>
              </View>
              {this.drawTooltip(this.state.selectedIndex)}
              {drawXAxis()}
              <View style={{
                marginLeft: this.props.defaultColumnWidth / 2
              }}>
                {drawXAxisLabels(this.state.sortedData, this.state.gap)}
              </View>
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
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderColor: '#AAAAAA',
    borderWidth: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8
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
