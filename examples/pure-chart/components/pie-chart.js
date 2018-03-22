import React, { Component } from 'react'
import { AppRegistry, StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native'
class PieChart extends React.Component {
  constructor (props) {
    super(props)
    this.drawPie = this.drawPie.bind(this)
    this.initData = this.initData.bind(this)
    this.handleEvent = this.handleEvent.bind(this)
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
    })
  }
  handleEvent (evt) {
    /* this.setState({
      evtX: evt.nativeEvent.pageX,
      evtY: evt.nativeEvent.pageY
    }) */
    let pageX = evt.nativeEvent.pageX
    let pageY = evt.nativeEvent.pageY

    this.refs.test.measure((fx, fy, width, height, px, py) => {
      this.setState({
        evtX: pageX - px,
        evtY: pageY - py
      })
    })
  }

  drawInfo (x, y) {
    let dist = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5)
    // console.log('x: ' + x + '  y: ' + y)
    if (dist <= 100) {
      let index = -1
      // 중심 y축 기준으로 오른쪽 왼쪽
      let pos = x > 0 ? Math.PI / 2 - Math.asin(y / dist) : Math.PI * 3 / 2 + Math.asin(y / dist)
      // index 값 정하기 piePos piePos 값보다 pos값이 작을 경우 멈춤
      for (let i = 0; i < this.state.piePos.length; i++) {
        if (this.state.piePos[i] > pos) break
        index++
      }
      let marginLeft = x
      let marginTop = -y

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

  getTransform (rad, width) {
    let x = (0 - width / 2) * Math.cos(rad) - (0 - width / 2) * Math.sin(rad)
    let y = (0 - width / 2) * Math.sin(rad) + (0 - width / 2) * Math.cos(rad)

    return [ {translateX: (-1 * x) - width / 2}, {translateY: (-1 * y) - width / 2 }, { rotate: rad + 'rad' } ]
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
          </View>
        </View>
      </View>
    )
  }
  drawPie (angle, color) {
    // angle: 0 ~ 2PI
    return (
      <View>
        {angle > 1 / 2 * Math.PI ? (
          <View>
            {this.drawPie(1 / 2 * Math.PI, color)}
            <View style={{
              position: 'absolute',
              transform: this.getTransform(angle - 1 / 2 * Math.PI, 50)
            }}>
              {this.drawPie(angle - 1 / 2 * Math.PI, color)}
            </View>
          </View>

        ) : (
          <View style={{
            width: 50,
            height: 50
          }}>
            <View style={{
              width: 50,
              height: 50,
              overflow: 'hidden'
            }}>
              <View style={{
                width: 50,
                height: 50,
                borderBottomRightRadius: 50,
                backgroundColor: color,
                transform: this.getTransform(Math.PI / 2 - angle, 50)
              }} />
            </View>
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

          transform: this.getTransform(this.state.piePos[i], 50),
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
      <View ref='test' collapsable={false}>

        <TouchableWithoutFeedback onPress={(evt) => this.handleEvent(evt)}>
          <View style={styles.container}>
            {
               this.drawT()
            }
            {
              // this.drawInfo(this.state.evtX - 100, -this.state.evtY + 100)
            }

          </View>

        </TouchableWithoutFeedback>
      </View>
    )
  }
}

PieChart.defaultProps = {
  data: [10, 20, 40, 60],
  colors: ['green', 'red', 'blue', 'black', 'yellow', 'purple']
}
const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center'
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
  },
  // 사분원 우상사분원
  rightUpQuarterCircle: {
    width: 100,
    height: 100,
    position: 'absolute',
    borderTopRightRadius: 100
  }
})

export default PieChart
