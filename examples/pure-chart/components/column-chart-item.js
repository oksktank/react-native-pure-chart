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
        <View ref='chartView' style={[styles.bar2, {width: this.props.defaultWidth, height: this.props.value, backgroundColor: this.props.primaryColor}]}>
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
  },
  bar2: {
    justifyContent: 'flex-end',
    marginRight: 20
  }
})

ColumnChartItem.propTypes = {
  value: PropTypes.number,
  onClick: PropTypes.func,
  onLayout: PropTypes.func,
  defaultWidth: PropTypes.number,
  primaryColor: PropTypes.string
}
ColumnChartItem.defaultProps = {
  value: 0
}
