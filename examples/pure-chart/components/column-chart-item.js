import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'

export default class ColumnChartItem extends Component {
  constructor (props) {
    super(props)
    this.handlePressIn = this.handlePressIn.bind(this)
  }

  handlePressIn (evt) {
    this.refs.chartView.measure((ox, oy, width, height, px, py) => {
      this.props.onClick(evt, width)
    })
  }

  render () {
    return (
      <TouchableWithoutFeedback onPressIn={this.handlePressIn}>
        <View ref='chartView' style={[styles.bar, {height: this.props.value}]}>
          <Text style={{fontSize: 5}}>{'[' + Math.round(this.props.value) + ']'}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  bar: {
    flex: 1,
    backgroundColor: 'red'
  }
})

ColumnChartItem.propTypes = {
  value: PropTypes.number,
  onClick: PropTypes.func,
  onLayout: PropTypes.func
}
ColumnChartItem.defaultProps = {
  value: 0
}
