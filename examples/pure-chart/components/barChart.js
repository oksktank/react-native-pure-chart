import React from 'react'
import { View, Animated, StyleSheet, Text } from 'react-native'

export default class BarChart extends React.Component {
  constructor (props) {
    super(props)
    const width = {pts: 30}
    this.state = {
      pts: new Animated.Value(width.pts)
    }
  }

  handeleAnimation () {
    const timing = Animated.timing
    const width = {pts: 14}
    const indicators = ['pts']
    Animated.parallel(indicators.map(item => {
      return timing(this.state[item], {toValue: width[item]})
    })).start()
  }

  render () {
    const { pts } = this.state

    return (
      <View>
        {pts &&
          <Animated.View style={[styles.bar, styles.points, {width: pts}]} />
          }
        <Text onPress={this.handeleAnimation.bind(this)}>Button</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  bar: {
    alignSelf: 'center',
    borderRadius: 5,
    height: 8,
    marginRight: 5
  },
  points: {
    backgroundColor: '#F55443'
  }
})
