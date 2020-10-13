import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native'

export default class ColumnChartItem extends Component {
  render () {
    let renders = []
    let seriesCount = this.props.seriesArray.length
    for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
      let lastElementMarginRight = 0
      let lastElementMarginLeft = 0  
      let width = this.props.defaultWidth / seriesCount/1.2
      if (seriesIndex === (seriesCount - 1)) {
        lastElementMarginRight = this.props.defaultMargin
      } else {
        if(this.props.dataIndex === 0) {
          lastElementMarginLeft = this.props.defaultMargin
        }
      }
      renders.push(
        <View key={seriesIndex} style={[styles.bar, {
          width: width,
          height: this.props.seriesArray[seriesIndex].data[this.props.dataIndex]['ratioY'],
          marginRight: lastElementMarginRight,
          marginLeft: lastElementMarginLeft,
          backgroundColor: this.props.seriesArray[seriesIndex].seriesColor,
          borderColor: this.props.isSelected ? this.props.highlightColor : this.props.defaultBorderColor,
          borderRadius:1000,
        }]} />
      )
    }
    return (
      <TouchableWithoutFeedback onPressIn={(evt) => this.props.onClick(evt)}>
        <View style={{height: this.props.defaultHeight}}>
          <View style={styles.chartView}>
            {renders}
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  chartView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingTop: 20
  },
  bar: {
    justifyContent: 'flex-end',
    borderWidth: 1
  }
})

ColumnChartItem.propTypes = {
  seriesArray: PropTypes.array,
  onClick: PropTypes.func,
  defaultWidth: PropTypes.number,
  defaultHeight: PropTypes.number,
  defaultMargin: PropTypes.number,
  primaryColor: PropTypes.string,
  highlightColor: PropTypes.string
}
