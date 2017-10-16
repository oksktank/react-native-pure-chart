import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Text } from 'react-native'
import ColumnChartItem from './column-chart-item'
import _ from 'lodash'

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
      columnWidth: 0,
      guideArray: newState.guideArray
    }
    this.renderColumns = this.renderColumns.bind(this)
    this.initData = this.initData.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleLayout = this.handleLayout.bind(this)
    this.drawGuideLine = this.drawGuideLine.bind(this)
    this.refineData = this.refineData.bind(this)
  }

  initData (dataProp) {
    if (dataProp.length === 0) {
      return {
        sortedData: [],
        max: 0,
        guideArray: []
      }
    }
    let values = []
    dataProp.map((value) => {
      if (typeof value === 'number') {
        values.push(value)
      } else if (typeof value === 'object' && typeof value.y === 'number') {
        values.push(value.y)
      }
    })
    let max = Math.max.apply(null, values)
    let sortedData = this.refineData(dataProp, max)
    let x = parseInt(max)
    let arr = []
    let length
    let temp
    let postfix = ''
    if (x > -1 && x < 1000) {
      x = Math.round(x * 10)
      temp = 1
    } else if (x >= 1000 && x < 1000000) {
      postfix = 'K'
      x = Math.round(x / 100)
      temp = 100
    } else if (x >= 1000000 && x < 1000000000) {
      postfix = 'M'
      x = Math.round(x / 100000)
      temp = 100000
    } else {
      postfix = 'B'
      x = Math.round(x / 100000000)
      temp = 100000000
    }
    length = x.toString().length

    x = _.round(x, -1 * length + 1) / 10
    let first = parseInt(x.toString()[0])

    if (first > -1 && first < 3) { // 1,2
      x = 2.5 * x / first
    } else if (first > 2 && first < 6) { // 4,5
      x = 5 * x / first
    } else {
      x = 10 * x / first
    }
    for (let i = 1; i < 6; i++) {
      let v = x / 5 * i
      arr.push([v + postfix, v * temp * 10 / max * this.props.height])
    }
    return {
      sortedData: sortedData,
      max: max,
      guideArray: arr
    }
  }

  refineData (dataProp, max) {
    let data = []
    let length = dataProp.length
    let simpleTypeCount = 0
    let objectTypeCount = 0

    for (let i = 0; i < length; i++) {
      let maxClone = max

      if (maxClone === 0) {
        maxClone = 1
      }

      if (typeof dataProp[i] === 'number') {
        simpleTypeCount++
        data.push([i * this.props.gap, dataProp[i] / maxClone * this.props.height, dataProp[i]])
      } else if (typeof dataProp[i] === 'object') {
        if (typeof dataProp[i].y === 'number' && dataProp[i].x) {
          objectTypeCount++
          data.push([i * this.props.gap, dataProp[i].y / maxClone * this.props.height, dataProp[i].y, dataProp[i].x])
        }
      }
    }

    // validate
    let isValidate = false
    if (simpleTypeCount === length || objectTypeCount === length) {
      isValidate = true
    }
    console.log('validate', isValidate, data, max)
    if (isValidate) {
      return data.sort((a, b) => { return a[0] - b[0] })
    } else {
      return []
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

  drawYAxis () {
    return (
      <View style={{
        borderRightWidth: 1,
        borderColor: '#e0e0e0',
        width: 1,
        height: '100%',
        marginRight: 0

      }} />

    )
  }

  drawGuideLine (arr) {
    return (
      <View style={{
        width: '100%',
        height: '100%',
        position: 'absolute'
      }}>

        {arr.map((v, i) => {
          return (
            <View
              key={'guide' + i}
              style={{
                width: '100%',
                borderTopWidth: 1,
                borderTopColor: '#e0e0e0',
                bottom: v[1],
                position: 'absolute'
              }} />
          )
        })}

      </View>
    )
  }

  render () {
    return (
      <View style={{ height: this.props.height, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, borderColor: 'blue', borderWidth: 1 }}>
        <View ref='chartView' style={{flexDirection: 'row', alignItems: 'flex-end', margin: 0, paddingRight: 0}}>
          {this.drawYAxis()}
          {this.drawGuideLine(this.state.guideArray)}
          <View style={[styles.container, {height: '100%'}]}>
            {this.renderColumns()}
          </View>
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
  height: 100,
  gap: 50
}
