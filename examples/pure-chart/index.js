import React from 'react'
import PropTypes from 'prop-types'
import {View} from 'react-native'
import LineChart from './components/line-chart'
import ColumnChart from './components/column-chart'
import ColumnHorizontalChart from './components/column-horizontal-chart'
export default class PureChart extends React.Component {
  constructor (props) {
    super(props)
    this.renderChart = this.renderChart.bind(this)
  }
  renderChart () {
    if (this.props.type === 'line') {
      return <LineChart data={this.props.data} primaryColor={this.props.color} />
    } else if (this.props.type === 'bar') {
      return <ColumnChart data={this.props.data} primaryColor={this.props.color} highlightColor={this.props.highlightColor} />
    } else if (this.props.type === 'bar-horizontal') {
      return <ColumnHorizontalChart data={this.props.data} primaryColor={this.props.color} width={this.props.width}/>
    } else if (this.props.type === 'pie') {
      return null
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
  highlightColor: PropTypes.string
}
PureChart.defaultProps = {
  color: '#297AB1'
}
