import React, { Component, PropTypes } from 'react'
import { View, StyleSheet } from 'react-native'
import ColumnChartItem from './column-chart-item'

export default class ColumnChart extends Component {
  constructor (props) {
    super(props)
    let newState = this.initData(this.props.data)
    this.state = {
      sortedData: newState.sortedData,
      max: newState.max
    }
    this.renderColumns = this.renderColumns.bind(this)
    this.initData = this.initData.bind(this)
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
      data.push([i * 10, dataProp[i] / max * 100])
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
        <ColumnChartItem key={i} value={value[1]} />
      )
    })
  }

  render () {
    return (
      <View style={{height: 300, borderColor: 'blue', borderWidth: 1}}>
        <View style={styles.container}>
          {this.renderColumns()}
        </View>
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
  data: [[0, 0]]
}
