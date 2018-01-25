import React, { Component } from 'react'
import { AppRegistry, StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native'
class PieChart extends React.Component {
  constructor (props) {
    super(props)
    this.drawPie = this.drawPie.bind(this)
    this.initData = this.initData.bind(this)
    this.state = {
      // pieSize[i] : size of ith pie, piePos[i] : starting position of ith pie;
      pieSize: [],
      piePos: [],
      evtX: 200,
      evtY: 200
    }
  }
  // initData!!
  componentDidMount () {
    this.initData(this.props.data)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.initData(nextProps.data)
    }
  }
  // initialize data
  initData (data) {
    // validation
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i]
    }
    // pieSize에는 각각 라디안값이 들어감
    let pieSize = data.map((v) => {
      return v / sum * 2 * Math.PI
    })
    let piePos = []
    piePos[0] = 0
    for (let i = 1; i < data.length; i++) {
      piePos[i] = piePos[i - 1] + pieSize[i - 1]
    }
    this.setState({
      pieSize: pieSize,
      piePos: piePos
    }, () => {
      console.log('!!', this.state.piePos)
      console.log('@@', this.state.pieSize)
    })
  }
  handleEvent (evt) {
    console.log('x: ' + evt.nativeEvent.locationX + '\ny: ' + evt.nativeEvent.locationY)
    this.setState({
      evtX: evt.nativeEvent.locationX,
      evtY: evt.nativeEvent.locationY
    })
  }
  drawInfo (x, y) {
    console.log(x + '  ' + y)
    let dist = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5)
    console.log(dist)
    if (dist <= 100) {
      let pos = 0
      let index = -1
      if (x >= 0 && y >= 0) {
        pos = Math.PI / 2 - Math.asin(y / dist)
      } else if (x >= 0 && y <= 0) {
        pos = Math.PI / 2 - Math.asin(y / dist)
      } else if (x <= 0 && y <= 0) {
        pos = Math.PI * 3 / 2 + Math.asin(y / dist)
      } else {
        pos = Math.PI * 3 / 2 + Math.asin(y / dist)
      }
      for (let i = 0; i < this.state.piePos.length; i++) {
        console.log('확인' + this.state.piePos[i])
        if (this.state.piePos[i] > pos) break
        index++
      }
      let marginLeft = x
      let marginTop = -y

      console.log(pos + ' ' + index + ' ' + marginLeft + ' ' + marginTop)

      return (
        <View style={{
          width: 100,
          height: 80,
          borderWidth: 3,
          borderColor: 'black',
          marginLeft: marginLeft,
          marginTop: marginTop
        }} >
          <Text>{Math.round(this.state.pieSize[index] / (2 * Math.PI) * 10000) / 100 + '\n' + this.props.data[index]} </Text>
        </View>

      )
    }
  }
  drawTest (angle, color) {
    return (
      <View style={{
        // ##위치 정해야함
        width: 100 + Math.sin(angle) * 100,
        height: (1 - Math.cos(angle)) * 100,
        borderWidth: 0,
        borderColor: '#00AA00'
      }}>
        <View style={{}}>
          {
              // 사각형 그릴 공간 여기에 .parent {overflow: hidden}을 넣을 것
          }
          {(console.log('test2'))}
          <View style={[styles.circle, {
            backgroundColor: color
          }]} />
          <View style={{
            // 덮어씨우는 정사각형 반은 투명 반은 흰색
            flexDirection: 'row',
            width: 200,
            height: 200,
            transform: [{ rotate: `${angle}rad` }]
          }}>
            {(console.log('test3', angle))}
            <View style={{
              width: 100,
              height: 200,
              backgroundColor: 'transparent'
            }} />
            <View style={{
              width: 100,
              height: 200,
              backgroundColor: 'white'
            }} />
            {(console.log('test4'))}
          </View>
        </View>
      </View>
    )
  }
  drawPie (angle, color) {
    (console.log('testStart'))
    // angle: 0 ~ 2PI
    return (
      <View>
        {angle > 1 / 2 * Math.PI ? (
          <View style={{position: 'relative'}}>
            {this.drawPie(1 / 2 * Math.PI, color)}
            {(console.log('test'))}
            <View style={{

              position: 'absolute',
              transform: [{ rotate: `${1 / 2 * Math.PI}rad` }]
            }}>
              {this.drawPie(angle - 1 / 2 * Math.PI, color)}
            </View>
          </View>
        ) : (
          // 예각인 파이를 그릴 공간
          <View style={{
            position: 'relative',
            width: 200,
            height: 200
          }}>
            {(console.log('test'))}
            <View style={{
              width: Math.sin(angle) * 100,
              position: 'relative',
              marginLeft: 100,
              overflow: 'hidden',
              borderColor: '#AA0000',
              borderWidth: 0,
              height: (1 - Math.cos(angle)) * 100
            }}>
              <View style={{left: -100}}>
                {this.drawTest(angle, color)}
              </View>
            </View>
            <View style={{
              // right triangle
              width: 0,
              height: 0,
              left: 100,
              borderBottomWidth: Math.cos(angle) * 100,
              borderBottomColor: 'transparent',
              borderLeftWidth: Math.sin(angle) * 100,
              borderLeftColor: color
            }} />
            {(console.log('test5'))}
          </View>
          )}
      </View>
    )
  }
  drawT () {
    let pies = []
    if (this.state.pieSize.length === 0) return null
    for (let i = 0; i < this.state.pieSize.length; i++) {
      pies.push(
        <View key={`t${i}`} style={{
          transform: [{ rotate: `${this.state.piePos[i]}rad` }],
          position: 'absolute'
        }}>
          {this.drawPie(this.state.pieSize[i], this.props.colors[i])
            }
        </View>
        )
    }
    return (
      pies
    )
  }
  render () {
    return (
      <View>

        <TouchableWithoutFeedback onPress={(evt) => this.handleEvent(evt)} >
          <View style={styles.container}>
            {
              this.drawT()
            }
            {
              this.drawInfo(this.state.evtX - 100, -this.state.evtY + 100)
            }
          </View>

        </TouchableWithoutFeedback>
      </View>
    )
  }
}

PieChart.defaultProps = {
  data: [200000, 1000000],
  colors: ['red', 'blue', 'green', 'yellow', 'pink']
}
const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'red',
    borderWidth: 3
  },
  // 반지름이 100인 원
  circle: {
    width: 200,
    position: 'absolute',
    height: 200,
    borderRadius: 100
  },
  // 정사각형을 반토막낸 직사각형
  rectangle: {
    width: 100,
    height: 200,
    left: 0,
    position: 'absolute',
    backgroundColor: 'transparent'
  },
  // 우반원
  rightHalfCircle: {
    width: 100,
    height: 200,
    left: 100,
    position: 'absolute',
    borderBottomRightRadius: 200,
    borderTopRightRadius: 200
  }
})

export default PieChart
