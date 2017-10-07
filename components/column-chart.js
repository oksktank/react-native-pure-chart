import React, { Component, PropTypes } from 'react'
import { View, StyleSheet } from 'react-native'
import ColumnChartItem from './column-chart-item'

export default class ColumnChart extends Component {
  constructor (props) {
    super(props)
    this.renderColumns = this.renderColumns.bind(this)
  }

  renderColumns () {
    return this.props.data.map((value, i) => {
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
