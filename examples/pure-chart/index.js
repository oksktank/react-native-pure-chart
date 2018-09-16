import React from 'react'
import PropTypes from 'prop-types'
import {View} from 'react-native'

import LineChart from './components/line-chart'
import ColumnChart from './components/column-chart'
import PieChart from './components/pie-chart'
import HBarChart from './components/hbar-chart'
import ColumnHorizontalChart from './components/column-horizontal-chart'
export default class PureChart extends React.Component {
  constructor (props) {
    super(props)
    this.renderChart = this.renderChart.bind(this)
  }
  renderChart () {
    if (this.props.type === 'line') {
      return <LineChart {...this.props} />
    } else if (this.props.type === 'bar') {
      return <ColumnChart {...this.props} />
    } else if (this.props.type === 'bar-horizontal') {
      return <ColumnHorizontalChart {...this.props} />
    } else if (this.props.type === 'pie') {
      return <PieChart data={this.props.data} primaryColor={this.props.color} />
    } else if (this.props.type === 'hbar') {
      return <HBarChart data={this.props.data} />
    }
  }
  render () {
    return (
      <View>
        {this.renderChart()}
      </View>
    )
  }
}

PureChart.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  color: PropTypes.string,
  height: PropTypes.number,
  numberOfYAxisGuideLine: PropTypes.number,
  customValueRenderer: PropTypes.func,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string
}
PureChart.defaultProps = {
  color: '#297AB1',
  height: 100,
  numberOfYAxisGuideLine: 5,
  backgroundColor: '#FFFFFF'
}
