import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'

export default class ColumnChartItem extends Component {
  render () {
    return (
      <TouchableWithoutFeedback onPressIn={(evt) => this.props.onClick(evt)}>
        <View ref='chartView' style={[styles.bar, {
          width: this.props.defaultWidth,
          height: this.props.value,
          backgroundColor: this.props.primaryColor,
          marginRight: this.props.defaultMargin}]}>
          <Text style={{fontSize: 5}}>{'[' + Math.round(this.props.value) + ']'}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  bar: {
    justifyContent: 'flex-end'
  }
})

ColumnChartItem.propTypes = {
  value: PropTypes.number,
  onClick: PropTypes.func,
  defaultWidth: PropTypes.number,
  defaultMargin: PropTypes.number,
  primaryColor: PropTypes.string
}
ColumnChartItem.defaultProps = {
  value: 0
}
