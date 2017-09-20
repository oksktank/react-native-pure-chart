import React from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'
import SimpleChart from './components/simpleChart'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.generateData = this.generateData.bind(this)
    this.state = {
      data: [[0, 0]]
    }
  }

  generateData () {
    var data = []
    for (var i = 0; i < 30; i++) {
      data.push([i * 10, Math.round(Math.random() * 100)])
    }

    this.setState({data: data})
  }
  render () {
    return (
      <View style={styles.container}>
        <View style={{}}>
          <SimpleChart data={this.state.data} />
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
