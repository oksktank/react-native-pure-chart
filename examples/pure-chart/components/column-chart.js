import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Text } from 'react-native'
import ColumnChartItem from './column-chart-item'

export default class ColumnChart extends Component {
  constructor (props) {
    super(props)
    let newState = this.initData(this.props.data)
    this.state = {
      sortedData: newState.sortedData,
      max: newState.max,
      msg: 'Initialize.',
      selectedX: 0,
      selectedY: 0,
      columnWidth: 0
    }
    this.renderColumns = this.renderColumns.bind(this)
    this.initData = this.initData.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleLayout = this.handleLayout.bind(this)
  }

  initData (dataProp) {
    if (dataProp.length === 0) {
      return {
        sortedData: [],
        max: 0
      }
    }
    let data = []
    let length = dataProp.length
    let max = Math.max.apply(null, dataProp)
    for (let i = 0; i < length; i++) {
      data.push([i * 10, dataProp[i] / max * this.props.height])
    }
    let sortedData = data.sort((a, b) => { return a[0] - b[0] })

    return {
      sortedData: sortedData,
      max: max
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(this.initData(nextProps.data))
    }
  }

  renderColumns () {
    return this.state.sortedData.map((value, i) => {
      return (
        <ColumnChartItem key={i} value={value[1]}
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
          `${index} : ${Math.round(value[1])}`,
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
    return (
      <View style={{height: this.props.height, borderColor: 'blue', borderWidth: 1}}>
        <View style={[styles.container]}>
          {this.renderColumns()}
        </View>
        <Text style={{position: 'absolute', left: this.state.selectedX, top: this.state.selectedY, borderColor: 'green', borderWidth: 1}}>{this.state.msg}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end'
  }
})

ColumnChart.propTypes = {
  data: PropTypes.array
}
ColumnChart.defaultProps = {
  data: [],
  height: 100
}
