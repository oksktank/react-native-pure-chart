import React, { Component } from 'react'
import { Alert, AppRegistry, StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native'
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
      pieIndex: [],
      currentPieIdx: -1,
      evtX: 0,
      evtY: 0
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
    let pieSize = []
    let pieIndex = []
    let index = 0
    for (let i = 0; i < data.length; i++) {
      if (data[i] / sum * 2 * Math.PI > Math.PI) {
        pieIndex.push(index)
        pieIndex.push(index)
        pieSize.push(Math.PI)
        pieSize.push(data[i] / sum * 2 * Math.PI - Math.PI)
      } else {
        pieIndex.push(index)
        pieSize.push(data[i] / sum * 2 * Math.PI)
      }
      index++
    }
    // piePos에는 각각 시작위치가 라디안 값으로 들어감
    let piePos = []
    piePos[0] = 0
    for (let i = 1; i < pieSize.length; i++) {
      piePos[i] = piePos[i - 1] + pieSize[i - 1]
    }
    this.setState({
      pieSize: pieSize,
      piePos: piePos,
      pieIndex: pieIndex
    })
  }
  handleEventOld (evt) {
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
  

  handleEvent (idx) {
    console.log(idx)
    this.setState({
      currentPieIdx: this.state.pieIndex[idx]
    })
  }
  /*
  handleEvent (a, b, c) {
    console.log(a)
    console.log(b)
    console.log(c)
  }
  */

  handleEventBak (evt, idx) {
    /* this.setState({
      evtX: evt.nativeEvent.pageX,
      evtY: evt.nativeEvent.pageY
    }) */

    // console.log(idx)
    let pageX = evt.nativeEvent.pageX
    let pageY = evt.nativeEvent.pageY
    this.setState({
      currentPieIdx: idx
    })
    this.refs.test.measure((fx, fy, width, height, px, py) => {
      this.setState({
        evtX: pageX - px,
        evtY: pageY - py

      })
    })
  }
  drawInfoOld (x, y) {
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

  drawInfo (index) {
    if (index !== -1) {
      return (
        <View style={{
          width: 100,
          height: 80,
          borderWidth: 3,
          borderColor: 'black'
        }}>
          <Text>{index}</Text>
        </View>
      )
    }
  }

  getTransform (rad, width, add = 0) {
    let x = (0 - width / 2) * Math.cos(rad) - (0 - width / 2) * Math.sin(rad)
    let y = (0 - width / 2) * Math.sin(rad) + (0 - width / 2) * Math.cos(rad)

    return [ {translateX: (-1 * x) - width / 2 + add}, { translateY: (-1 * y) - width / 2 }, { rotate: rad + 'rad' } ]
  }
  drawPie (angle, color, big, idx) {
    {
     // console.log(angle)
    }
    // angle: 0 ~ 2PI
    return (
      <View>
        {angle === 0 ? (
          <View />
        ) : (

          angle > (1 / 2 * Math.PI) ? (
            <View>
              <TouchableWithoutFeedback onPress={this.handleEvent(idx)}>
                <View style={{width: 100, height: 50}} />
                <View style={{flexDirection: 'row', backgroundColor: 'transparent'}}>

                  <View style={{

                    width: 50,
                    height: 50,

                    transform: this.getTransform(Math.PI / 2, 50, 50)
                  }}>

                    <View style={{
                    }}>
                      {this.drawPie(angle - 1 / 2 * Math.PI, color, false, idx)}
                    </View>
                  </View>

                  <View style={{
                    opacity: 1,

                    width: 50,
                    height: 50
                  }}>
                    {this.drawPie(1 / 2 * Math.PI, color, false, idx)}
                  </View>

                </View>
              </TouchableWithoutFeedback>
            </View>

        ) : (
          // big 사용이유
          big ? (
            <View style={{
              width: 100,
              height: 100
            }}>
              <TouchableWithoutFeedback onPress={this.handleEvent(idx)}>
                <View style={{width: 100, height: 50}} />
                <View style={{flexDirection: 'row'}}>
                  <View style={{width: 50, height: 50}} />
                  <View style={{
                    width: 50,
                    height: 50,
                    overflow: 'hidden',
                    borderWidth: 0,
                    borderColor: 'yellow'
                  }}>
                    <View style={{
                      width: 50,
                      height: 50,
                      borderBottomRightRadius: 50,
                      backgroundColor: color,
                      transform: this.getTransform(angle - Math.PI / 2, 50)
                    }} />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          ) : (
            <View style={{
              width: 50,
              height: 50
            }}>
              <TouchableWithoutFeedback onPress={this.handleEvent(idx)}>
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
                    transform: this.getTransform(angle - Math.PI / 2, 50)
                  }} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          )
        ))}
      </View>
    )
  }
  drawT () {
    let pies = []
    if (this.state.pieSize.length === 0) return null
    for (let i = 0; i < this.state.pieSize.length; i++) {
      pies.push(
        <View key={`t${i}`} style={{

          transform: [{rotate: `${this.state.piePos[i]}rad`}],
          position: 'absolute'

        }}>
          {
            this.drawPie(this.state.pieSize[i], this.props.colors[this.state.pieIndex[i]], true, i)
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
        <View style={styles.container}>
          {
            this.drawT()
          }
          {
            // this.drawInfo(this.state.currentPieIdx)
          }

        </View>
      </View>
    )
  }
}

PieChart.defaultProps = {
  data: [10, 20, 40, 100],
  colors: ['green', 'red', 'blue', 'black', 'yellow', 'purple', 'blue', 'orange']
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
