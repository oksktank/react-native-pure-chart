import React from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'
import PureChart from './pure-chart'
import moment from 'moment'
export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.generateData = this.generateData.bind(this)
    this.state = {
      data: [],
      pieData: [{label: '사람', value: 110, color: 'red'}, {label: '동물', value: 140, color: 'green'} ],
      pieData2: [{value: 220700.26, color: 'red'}, { value: 140700.89, color: 'yellow'} ],
      pieData3: [{value: 220}, { value: 140} ]
    }
  }

  // 파이차트 테스트 하기
  /*
  componentDidMount () {

    this.test = 0
    setInterval(() => {
      if (this.test < 360) {
        this.test++
        this.setState({
          pieData: [this.test, 360 - this.test]
        })
      }
    }, 5)
  }
  */

  generateData () {
    var data = []
    var data2 = []
    var data3 = []
    var pieData = []
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

    for (let i = 0; i < 5; i++) {
      pieData.push({
        value: Math.round(Math.random() * 500)
      })
    }

    // this.setState({data: [
    //   {seriesName: 'test', data: data, color: '#ff4b00'},
    //    {seriesName: 'test2', data: data2, color: '#0e95de'},
    //    {seriesName: 'test3', data: data3, color: '#00c19b'}
    // ]})

    this.setState({
      data: [{seriesName: 'test2', data: data2, color: '#0e95de'}],
      pieData: pieData
    })
  }
  render () {
    return (
      <View style={styles.container}>
        <View style={{padding: 20}}>
          <PureChart type={'line'} data={this.state.data} />
          <PureChart type={'bar'} data={this.state.data} />
          <PureChart type={'pie'} data={this.state.pieData} />
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
