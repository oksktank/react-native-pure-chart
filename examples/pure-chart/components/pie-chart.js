import React, { Component } from 'react'
import { Alert, AppRegistry, StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { numberWithCommas } from '../common'

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
      oldPiePos: [],
      pieIndex: [],
      dataSum: 0,
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

    let oldPiePos = []
    for (let i = 0; i < this.props.data.length; i++) {
      oldPiePos[i] = -1
    }
    for (let i = 0; i < piePos.length; i++) {
      if (oldPiePos[pieIndex[i]] === -1) {
        oldPiePos[pieIndex[i]] = piePos[i]
      }
    }

    /*
    for (let i = 0; i < this.props.data.length; i++) {
      console.log(oldPiePos[i])
    }
    */

    /*
    for (let i = 0; i < data.length; i++) {
      console.log(data[i].value)
      console.log(labels[i])
      console.log(colors[i])
    }
    */

    this.setState({
      labels: labels,
      colors: colors,
      pieSize: pieSize,
      piePos: piePos,
      selectedIndex: -1,
      pieIndex: pieIndex,
      angles: angles,
      dataSum: sum,
      oldPiePos: oldPiePos
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
    const {size} = this.props
    this.refs.test.measure((fx, fy, width, height, px, py) => {
      let evtX = pageX - px
      let evtY = (pageY - py)
      let originX = pageX - px - size / 2
      let originY = size / 2 - (pageY - py)
      let rSquare = Math.pow(originX, 2) + Math.pow(originY, 2)
      let dx = originX
      let dy = -1 * originY
      let rad = Math.atan2(dy, dx)
      let degree = (rad * 180) / Math.PI
      if (degree < 0) degree = 360 + degree
      let inPie = rSquare < Math.pow(size / 2, 2)
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
 //   console.log(idx)
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
    const {size} = this.props
    let dist = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5)
    // console.log('x: ' + x + '  y: ' + y)
    if (dist <= size) {
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
          marginLeft: marginLeft,
          marginTop: marginTop
        }} >
          <Text>{Math.round(this.state.pieSize[index] / (2 * Math.PI) * 10000) / 100 + '\n' + this.state.value[index]} </Text>
        </View>
      )
    }
  }

  drawInfoT (index) {
    const {size} = this.props

    let pos = (this.state.oldPiePos[index] + this.state.oldPiePos[(index + 1) % this.state.oldPiePos.length]) / 2
    if (index + 1 === this.props.data.length) {
      pos += Math.PI
    }
    let x = size / 4 * Math.cos(-pos) + size / 2
    let y = -size / 4 * Math.sin(-pos) + size / 2

    if (index !== -1) {
      let percentage = Math.round((this.props.data[index].value * 1000 / this.state.dataSum)) / 10 + '%'
      let valueStr = numberWithCommas(this.props.data[index].value, false)
      return (
        <View style={{
          height: size
        }}>
          <View style={{
            marginLeft: x - 60,
            marginTop: y - 40,
            borderWidth: 1,
            borderRadius: 5,
            padding: 5,
            borderColor: '#e0e0e0',
            backgroundColor: '#FFFFFF'
          }}>
            <View style={{flexDirection: 'row', paddingLeft: 5, alignItems: 'center'}}>
              <View style={{
                width: 10,
                height: 5,
                marginRight: 3,
                borderRadius: 2,
                backgroundColor: this.state.colors[index]
              }} />
              <Text style={styles.tooltipTitle}>{this.state.labels[index] ? this.state.labels[index] : valueStr}</Text>
            </View>

            <Text style={styles.tooltipValue}>{this.state.labels[index] ? `${valueStr} (${percentage})` : percentage}</Text>

          </View>
        </View>
      )
    }
  }
  drawInfo (index, x, y) {
    const {size} = this.props
    if (index !== -1) {
      return (
        <View style={{
          width: size,
          height: size
        }}>
          <View style={{
            width: 60,
            height: 80,
            marginLeft: x - 30,
            marginTop: y - 40,
            borderWidth: 2,
            borderRadius: 5,
            borderColor: '#e0e0e0',
            backgroundColor: '#FFFFFF'
          }}>

            {this.state.labels[index] !== null &&
              <Text>{this.state.labels[index]}</Text>
            }
            <View style={{flexDirection: 'row', paddingLeft: 5, alignItems: 'center'}}>
              <View style={{
                width: 10,
                height: 5,
                marginRight: 3,
                borderRadius: 2,
                backgroundColor: this.state.colors[index]
              }} />
              <Text style={styles.tooltipValue}>{this.props.data[index].value}</Text>
            </View>

            <Text style={styles.tooltipValue}>{this.props.data[index].value * 100 / this.state.dataSum + '%'}</Text>

          </View>
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
    const {size} = this.props
    return (
      <View>
        {angle === 0 ? (
          <View />
        ) : (
          angle > (1 / 2 * Math.PI) ? (
            <View>
              <View style={{width: size, height: size / 2}} />
              <View style={{flexDirection: 'row', backgroundColor: 'transparent'}}>

                <View style={{

                  width: size / 2,
                  height: size / 2,

                  transform: this.getTransform(Math.PI / 2, size / 2, size / 2)
                }}>

                  <View style={{
                  }}>
                    {this.drawPie(angle - 1 / 2 * Math.PI, color, false, idx)}
                  </View>

                </View>

                <View style={{
                  opacity: 1,

                  width: size / 2,
                  height: size / 2
                }}>
                  {this.drawPie(1 / 2 * Math.PI, color, false, idx)}
                </View>

              </View>
            </View>

        ) : (
          // big 사용이유
          big ? (
            <View style={{
              width: size,
              height: size
            }}>
              <View style={{width: size, height: size / 2}} />
              <View style={{flexDirection: 'row'}}>
                <View style={{width: size / 2, height: size / 2}} />
                <View style={{
                  width: size / 2,
                  height: size / 2
                }}>

                  <View style={{
                    width: size / 2,
                    height: size / 2,
                    borderBottomRightRadius: size / 2,
                    backgroundColor: color,
                    transform: this.getTransform(angle - Math.PI / 2, size / 2)
                  }} />

                </View>

              </View>
            </View>
          ) : (
            <View style={{
              width: size / 2,
              height: size / 2
            }}>

              <View style={{
                width: size / 2,
                height: size / 2
              }}>

                <View style={{
                  width: size / 2,
                  height: size / 2,
                  borderBottomRightRadius: size / 2,
                  backgroundColor: color,
                  borderWidth: 0,
                  borderColor: color,
                  transform: this.getTransform(angle - Math.PI / 2, size / 2)
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
    const {size} = this.props
    return (
      <View collapsable={false}>

        <TouchableWithoutFeedback onPress={(e) => {
          // const {locationX, locationY} = e.nativeEvent
          // console.log(locationX, locationY)
          // this.setState({locationX: locationX, locationY: locationY})
          this.handleEventOld(e)
        }}>

          <View ref='test' style={StyleSheet.flatten([styles.container, {
            width: size,
            height: size
          }])}>

            {this.drawT()}
            {this.drawInfoT(this.state.selectedIndex)}
          </View>

        </TouchableWithoutFeedback>
      </View>
    )
  }
}

PieChart.defaultProps = {
  data: [{value: 10}, {value: 20}, {value: 40}, {value: 100}],
  colors: ['#009ef2', '#ff4d7d', '#00c4c3', '#ffd12f', '#e7e9ed'],
  size: 200
}
const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginLeft: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tooltipTitle: {fontSize: 18, fontWeight: 'bold'},
  tooltipValue: {fontSize: 15, marginTop: 5}
})

export default PieChart
