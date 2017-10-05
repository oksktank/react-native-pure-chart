import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, Text } from 'react-native'

export default class ColumnChartItem extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <View style={[styles.bar, {height: this.props.value}]}>
        {/*<Text style={{fontSize: 10}}>{this.props.value}</Text>*/}
      </View>
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
