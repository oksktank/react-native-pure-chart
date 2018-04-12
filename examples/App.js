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
    for (var i = 0; i < 10; i++) {
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
          y: Math.round(Math.random() * 50)
        }
      )
      data3.push(
        {
          x: startDate.format('YYYY-MM-DD'),
          y: Math.round(Math.random() * 1000)
        }
      )
    }

    // this.setState({data: [
    //   {seriesName: 'test', data: data, color: '#ff4b00'},
    //    {seriesName: 'test2', data: data2, color: '#0e95de'},
    //    {seriesName: 'test3', data: data3, color: '#00c19b'}
    // ]})

    this.setState({
      data: [{seriesName: 'test2', data: data2, color: '#0e95de'}]
    })
  }
  render () {
    return (
      <View style={styles.container}>
        <View style={{padding: 20}}>
          <PureChart type={'line'}
            data={this.state.data}
            width={'100%'}
            height={200}
            customValueRenderer={(index, point) => {
              return (
                <Text style={{textAlign: 'center'}}>{point.y}</Text>
              )
            }}
            numberOfYAxisGuideLine={10} />
          <PureChart type={'bar'}
            data={this.state.data}
            height={200}
            numberOfYAxisGuideLine={10} />
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
