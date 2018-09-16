import React from 'react'
import { StyleSheet, View, Button } from 'react-native'
import PureChart from './pure-chart'
import moment from 'moment'
export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.generateData = this.generateData.bind(this)
    this.generateHData = this.generateHData.bind(this)
    this.state = {
      data: [],
      pieData: [ {label: '사람', value: 110, color: 'red'}, {label: '동물', value: 140, color: 'green'} ],
      pieData2: [ {value: 220700.26, color: 'red'}, { value: 140700.89, color: 'yellow' } ],
      pieData3: [ {value: 220}, { value: 140 } ]
    }
  }

  generateData () {
    var data = []
    var data2 = []
    var data3 = []
    var pieData = []
    var data4 = []
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
          y: Math.round(Math.random() * 50) + 0.5
        }
      )
      data3.push(
        {
          x: startDate.format('YYYY-MM-DD'),
          y: Math.round(Math.random() * 1000)
        }
      )
      data4.push(
        {
          x: startDate.format('YYYY-MM-DD'),
          y: Math.round(Math.random() * 300)
        }
      )
    }

    for (let i = 0; i < 5; i++) {
      pieData.push({
        value: Math.round(Math.random() * 500),
        label: 'Marketing'
      })
    }

    this.setState({data: [
      {seriesName: 'test', data: data, color: '#ff4b00'},
      {seriesName: 'test2', data: data2, color: '#0e95de'},
      {seriesName: 'test3', data: data3, color: '#00c19b'}
    ]})

    // this.setState({
    //   data: [
    //     {
    //       seriesName: 'test2', data: data.slice(), color: '#0e95de'
    //     }
    //   ],
    //   pieData: pieData
    // })
  }

  generateHData () {
    var data1 = [{key: 'Points', value: 10}, {key: 'Assists', value: 17}, {key: 'Rebounds', value: 9}, {key: 'Steals', value: 3}, {key: 'Blocks', value: 18}]
    var data2 = [{key: 'Points', value: 5}, {key: 'Assists', value: 2}, {key: 'Rebounds', value: 1}, {key: 'Steals', value: 5}, {key: 'Blocks', value: 6}]
    var data3 = [{key: 'Points', value: 19}, {key: 'Assists', value: 6}, {key: 'Rebounds', value: 15}, {key: 'Steals', value: 1}, {key: 'Blocks', value: 9}]
    var dataset = [{date: '20170901', datas: data1}, {date: '20170302', datas: data2}, {date: '20171022', datas: data3}]
    this.setState({
      data: dataset
    })
  }

  render () {
    return (
      <View style={styles.container}>
        <View style={{padding: 20, marginTop: 100}}>
          <PureChart type={'hbar'} data={this.state.data} />
          <Button title='data generate' onPress={this.generateHData} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
  }
})
