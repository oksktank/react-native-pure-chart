import React from 'react'
import PropTypes from 'prop-types'
import {View} from 'react-native'
import LineChart from './components/line-chart'

export default class PureChart extends React.Component {
  constructor (props) {
    super(props)
    this.renderChart = this.renderChart.bind(this)
  }
  renderChart () {
    if (this.props.type === 'line') {
      return <LineChart data={this.props.data} />
    } else if (this.props.type === 'bar') {
      return null
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
  data: PropTypes.array.isRequired
}
PureChart.defaultProps = {

}
