import React from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'
import PureChart from './pure-chart'
import moment from 'moment'
export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.generateData = this.generateData.bind(this)
    this.state = {
      data: []
    }
  }

  generateData () {
    var data = []
    var startDate = moment()
    for (var i = 0; i < Math.round(Math.random() * 10) + 30; i++) {
      startDate.add(1, 'days')
      data.push(
        {
          x: startDate.format('YYYY-MM-DD'),
          y: Math.round(Math.random() * 1000)
        }
      )
    }

    this.setState({data: [{seriesName: 'test', data: data}]})
  }
  render () {
    return (
      <View style={styles.container}>
        <View style={{padding: 20}}>
          <PureChart type={'line'} data={this.state.data} />
          <Button title='Generate chart data' onPress={this.generateData}>
            <Text>Generate chart data</Text>
          </Button>

        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100
  }
})
