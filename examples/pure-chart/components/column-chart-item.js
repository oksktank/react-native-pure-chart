import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native'

export default class ColumnChartItem extends Component {
  render () {
    let renders = []
    let seriesCount = this.props.seriesArray.length
    for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
      console.log('series : ', this.props.seriesArray[seriesIndex])
      let lastElementMarginRight = 0
      if (seriesIndex === (seriesCount - 1)) {
        lastElementMarginRight = this.props.defaultMargin
      }
      renders.push(
        <View key={seriesIndex} style={[styles.bar, {
          width: this.props.defaultWidth / seriesCount,
          height: this.props.seriesArray[seriesIndex].data[this.props.dataIndex]['ratioY'],
          marginRight: lastElementMarginRight,
          backgroundColor: this.props.seriesArray[seriesIndex].seriesColor
        }]} />
      )
    }
    return (
      <TouchableWithoutFeedback onPressIn={(evt) => this.props.onClick(evt)}>
        <View style={styles.chartView}>
          {renders}
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
  defaultMargin: PropTypes.number,
  primaryColor: PropTypes.string
}
