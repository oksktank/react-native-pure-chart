import React, { Component } from 'react'
import { Alert, AppRegistry, StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
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
      evtY: 0,
      selectedIndex: -1,
      labels: [],
      colors: []
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
    let colors = []
    let labels = []
    if (data[0].color) {
      for (let i = 0; i < data.length; i++) {
        colors[i] = data[i].color
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        colors[i] = this.props.colors[i % this.props.colors.length]
      }
      if (data.length === this.props.colors.length + 1) {
        // 임의로 3으로 지정함 바꿔도 무방
        colors[data.length - 1] = this.props.colors[3]
      }
    }

    if (data[0].label) {
      for (let i = 0; i < data.length; i++) {
        labels[i] = data[i].label
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        labels[i] = null
      }
    }

    // validation
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i].value
    }
    // pieSize에는 각각 라디안값이 들어감
    let pieSize = []
    let pieIndex = []
    let angles = []
    let index = 0
    let tempAngle = 0
    for (let i = 0; i < data.length; i++) {
      let angle = Math.round(data[i].value / sum * 360)
      angles.push(tempAngle + angle)
      tempAngle = tempAngle + angle
      if (data[i].value / sum * 2 * Math.PI > Math.PI) {
        pieIndex.push(index)
        pieIndex.push(index)
        pieSize.push(Math.PI)
        pieSize.push(data[i].value / sum * 2 * Math.PI - Math.PI)
      } else {
        pieIndex.push(index)
        pieSize.push(data[i].value / sum * 2 * Math.PI)
      }
      index++
    }
    // piePos에는 각각 시작위치가 라디안 값으로 들어감
    let piePos = []
    piePos[0] = 0
    for (let i = 1; i < pieSize.length; i++) {
      piePos[i] = piePos[i - 1] + pieSize[i - 1]
    }
    for (let i = 0; i < data.length; i++) {
      console.log(data[i].value)
      console.log(labels[i])
      console.log(colors[i])
    }

    this.setState({
      labels: labels,
      colors: colors,
      pieSize: pieSize,
      piePos: piePos,
      pieIndex: pieIndex,
      angles: angles
    })
  }
  handleEventOld (evt) {
    /* this.setState({
      evtX: evt.nativeEvent.pageX,
      evtY: evt.nativeEvent.pageY
    }) */
    let pageX = evt.nativeEvent.pageX
    let pageY = evt.nativeEvent.pageY
    const {angles} = this.state
    this.refs.test.measure((fx, fy, width, height, px, py) => {
      let evtX = pageX - px
      let evtY = (pageY - py)
      let originX = pageX - px - 50
      let originY = 50 - (pageY - py)
      let rSquare = Math.pow(originX, 2) + Math.pow(originY, 2)
      let dx = originX
      let dy = -1 * originY
      let rad = Math.atan2(dy, dx)
      let degree = (rad * 180) / Math.PI
      if (degree < 0) degree = 360 + degree
      let inPie = rSquare < Math.pow(50, 2)
      let selectedIndex = -1
      if (inPie) {
        for (let i = 0; i < angles.length; i++) {
          if (degree < angles[i]) {
            selectedIndex = i
            break
          }
        }
      }

      this.setState({
        evtX: evtX,
        evtY: evtY,
        originX: originX,
        originY: originY,
        inPie: inPie,
        selectedAngle: degree,
        selectedRad: rad,
        selectedIndex: selectedIndex
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
          <Text>{Math.round(this.state.pieSize[index] / (2 * Math.PI) * 10000) / 100 + '\n' + this.state.value[index]} </Text>
        </View>
      )
    }
  }

  drawInfo (index, x, y) {
    if (index !== -1) {
      return (
        <View style={{
          width: 50,
          height: 40,
          borderWidth: 3,
          borderColor: 'black',
          marginLeft: x - 25,
          marginTop: y - 20,
        }}>
          <Text>{this.state.labels[index]}</Text>
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
            </View>

        ) : (
          // big 사용이유
          big ? (
            <View style={{
              width: 100,
              height: 100
            }}>
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
                    overflow: 'hidden',
                    transform: this.getTransform(angle - Math.PI / 2, 50)
                  }} />

                </View>

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
                  borderWidth: 1,
                  transform: this.getTransform(angle - Math.PI / 2, 50),
                  overflow: 'hidden'
                }} />

              </View>

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
            this.drawPie(this.state.pieSize[i], this.state.colors[this.state.pieIndex[i]], true, i)
          }
        </View>
        )
    }
    return (
      pies
    )
  }
  render () {
    const {selectedIndex, locationX, locationY, evtX, evtY, inPie, selectedAngle,
      pieSize, angles} = this.state
    return (
      <View collapsable={false}>
        <TouchableWithoutFeedback onPress={(e) => {
          // const {locationX, locationY} = e.nativeEvent
          // console.log(locationX, locationY)
          // this.setState({locationX: locationX, locationY: locationY})
          this.handleEventOld(e)
        }}>
          <View ref='test' style={styles.container}>
            {
            this.drawT()
          }
            {
            this.drawInfo(this.state.selectedIndex, this.state.evtX, this.state.evtY)
          }
          </View>
        </TouchableWithoutFeedback>
        <Text>selected: {selectedIndex}</Text>
        <Text>({locationX},{locationY})</Text>
        <Text>({evtX},{evtY})</Text>
        <Text>is coordinate In Pie chart: {'' + inPie}</Text>
        <Text>angle: {selectedAngle}</Text>
        <Text>angles: {JSON.stringify(angles)}</Text>
      </View>
    )
  }
}

PieChart.defaultProps = {
  data: [{value: 10}, {value: 20}, {value: 40}, {value: 100}],
  colors: ['green', 'red', 'blue', 'black', 'yellow', 'purple', 'blue', 'orange']
}
const styles = StyleSheet.create({
  container: {
    width: 100,
    borderWidth: 1,
    backgroundColor: '#AA000050',
    overflow: 'hidden',
    marginLeft: 100,
    height: 100,
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
