import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'

export default class ColumnHorizontalChartItem extends Component {
  render () {
    let chartItemRenders = []
    let seriesArray = this.props.seriesArray
    let seriesCount = seriesArray.length
    if (seriesCount <= 0) {
      return null
    }
    for (let i = 0; i < seriesCount; i++) {
      chartItemRenders.push(
        <View key={i} style={{width: seriesArray[i].data[this.props.dataIndex].ratioY, height: 10, backgroundColor: seriesArray[i].seriesColor}} />
        )
    }
    return (
      <View>
        {chartItemRenders}
      </View>
    )
  }
}

ColumnHorizontalChartItem.propTypes = {
  seriesArray: PropTypes.array,
  dataIndex: PropTypes.number
}
ColumnHorizontalChartItem.defaultProps = {
  seriesArray: [],
  dataIndex: -1
}
