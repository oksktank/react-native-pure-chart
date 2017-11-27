import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native'

export default class ColumnChartItem extends Component {
  render(){
    let renders = []
    let seriesCount = this.props.values.length
    for(let i = 0; i < seriesCount; i++) {
      renders.push(
        <View key={i} style={[styles.bar,{
          width:this.props.defaultWidth, 
          height:this.props.values[i]['ratioY'], 
          marginRight: this.props.defaultMargin,
          backgroundColor: this.props.primaryColor
        }]}>
        </View>
      )
    }
    return (
      <TouchableWithoutFeedback onPressIn={(evt) => this.props.onClick(evt)}>
        <View>
            {renders}
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  bar: {
    justifyContent: 'flex-end',
    borderWidth: 1
  }
})

ColumnChartItem.propTypes = {
  values: PropTypes.array,
  onClick: PropTypes.func,
  defaultWidth: PropTypes.number,
  defaultMargin: PropTypes.number,
  primaryColor: PropTypes.string
}
