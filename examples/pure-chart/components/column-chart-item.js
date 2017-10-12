import React, { Component, PropTypes } from 'react'
import { View, StyleSheet } from 'react-native'

export default class ColumnChartItem extends Component {
  render () {
    return (
      <View style={[styles.bar, {height: this.props.value}]} />
    )
  }
}

const styles = StyleSheet.create({
  bar: {
    flex: 1,
    backgroundColor: 'red',
    width: 15
  }
})

ColumnChartItem.propTypes = {
  value: PropTypes.number
}
ColumnChartItem.defaultProps = {
  value: 0
}
