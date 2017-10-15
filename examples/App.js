import React from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'
import PureChart from './pure-chart'

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
    for (var i = 0; i < Math.round(Math.random() * 10) + 2; i++) {
      data.push(Math.round(Math.random() * 10000))
    }

    this.setState({data: data})
  }
  render () {
    return (
      <View style={styles.container}>
        <View style={{padding: 50}}>
          <PureChart type={'line'} data={this.state.data} />
          <PureChart type={'bar'} data={this.state.data} />
          <Button title='test' onPress={this.generateData}>
            <Text>start</Text>
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
