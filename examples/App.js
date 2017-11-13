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
    var data2 = []
    var data3 = []
    var startDate = moment()
    for (var i = 0; i < Math.round(Math.random() * 10) + 30; i++) {
      startDate.add(1, 'days')
      data.push(
        {
          x: startDate.format('YYYY-MM-DD'),
          y: Math.round(Math.random() * 500)
        }
      )
      data2.push(
        {
          x: startDate.format('YYYY-MM-DD'),
          y: Math.round(Math.random() * 1000)
        }
      )
      data3.push(
        {
          x: startDate.format('YYYY-MM-DD'),
          y: Math.round(Math.random() * 1000)
        }
      )
    }

    this.setState({data: [
      {seriesName: 'test', data: data, color: '#297AB1'},
      {seriesName: 'test2', data: data2, color: '#AA0000'},
      {seriesName: 'test3', data: data3, color: '#00AA00'}]})
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
    marginTop: 100,
    backgroundColor: '#AA0000'
  }
})
