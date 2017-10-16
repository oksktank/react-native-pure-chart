import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Animated, ScrollView, Easing } from 'react-native'
import ColumnChartItem from './column-chart-item'
import {initData, drawYAxis, drawGuideText, drawGuideLine, numberWithCommas} from '../common'

export default class ColumnChart extends Component {
  constructor (props) {
    super(props)
    let newState = initData(this.props.data, this.props.height, this.props.gap)
    this.state = {
      sortedData: newState.sortedData,
      max: newState.max,
      msg: 'Initialize.',
      selectedX: 0,
      selectedY: 0,
      columnWidth: 0,
      fadeAnim: new Animated.Value(0),
      guideArray: newState.guideArray
    }
    this.renderColumns = this.renderColumns.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleLayout = this.handleLayout.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(Object.assign({
        fadeAnim: new Animated.Value(0)
      }, initData(nextProps.data, this.props.height, this.props.gap)), () => {
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
          defaultWidth={this.props.gap} primaryColor={this.props.primaryColor}
          onClick={(evt, width) => this.handleClick(evt, i, value, width)}
          onLayout={(evt) => this.handleLayout(evt)} />
      )
    })
  }
  handleLayout (event) {
    this.setState({
      columnWidth: event.nativeEvent.layout.width
    })
  }

  handleClick (event, index, value, width) {
    this.setState({
      msg:
          `${index} : ${Math.round(value[1])}/${Math.round(value[2])}`,
          /* `
           locX: ${event.nativeEvent.locationX}, locY: ${event.nativeEvent.locationY},
           pageX: ${event.nativeEvent.pageX}, pageY: ${event.nativeEvent.pageY},
           width: ${width}
          `, */
      selectedX: (width * index) + (width + 5),
      selectedY: event.nativeEvent.locationY + (this.props.height - value[1])
    })
  }

  render () {
    let {fadeAnim} = this.state
    return (
      <View style={{flexDirection: 'row', borderWidth: 1, borderColor: 'blue'}}>
        <View style={{
          paddingRight: 5
        }}>
          {drawGuideText(this.state.guideArray, this.props.height)}
        </View>
        <View style={{ paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
          <View>
            <ScrollView horizontal>
              <View ref='chartView' style={{flexDirection: 'row', alignItems: 'flex-end', margin: 0, paddingRight: 0}}>

                {drawYAxis()}
                {drawGuideLine(this.state.guideArray)}
                <Animated.View style={{ transform: [{scaleY: fadeAnim}], flexDirection: 'row', alignItems: 'flex-end', height: '100%' }}>
                  {this.renderColumns()}
                </Animated.View>
              </View>
            </ScrollView>
          </View>

        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    borderWidth: 1,
    borderColor: 'green'
  },
  container2: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: 'green'
  }
})

ColumnChart.propTypes = {
  data: PropTypes.array
}
ColumnChart.defaultProps = {
  data: [],
  height: 100,
  gap: 25,
  primaryColor: '#297AB1'
}
