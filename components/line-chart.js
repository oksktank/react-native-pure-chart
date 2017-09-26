import React from 'react'
import { View, ScrollView, LayoutAnimation, TouchableWithoutFeedback, Text, UIManager } from 'react-native'

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)

class SimpleChart extends React.Component {
  constructor (props) {
    super(props)
    var newState = this.initData(this.props.data)
    this.state = {
      loading: false,
      sortedData: newState.sortedData,
      selectedIndex: null,
      nowHeight: 200,
      nowWidth: 200,
      scrollPosition: 0,
      nowX: 0,
      nowY: 0,
      max: newState.max
    }

    this.drawCoordinates = this.drawCoordinates.bind(this)
    this.drawSelected = this.drawSelected.bind(this)
    this.handlePress = this.handlePress.bind(this)
    this.handleLayout = this.handleLayout.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.initData = this.initData.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextState.sortedData !== this.state.sortedData ||
      nextState.selectedIndex !== this.state.selectedIndex ||
      nextState.scrollPosition !== this.state.scrollPosition) {
      return true
    } else {
      return false
    }
  }

  initData (dataProp) {
    if (dataProp.length === 0) {
      return {
        sortedData: [],
        max: 0
      }
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
    var data = []
    var length = dataProp.length
    var max = Math.max.apply(null, dataProp)
    for (var i = 0; i < length; i++) {
      data.push([i * 10, dataProp[i] / max * 100])
    }
    var sortedData = data.sort((a, b) => { return a[0] - b[0] })

    return {
      sortedData: sortedData,
      max: max
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(this.initData(nextProps.data))
    }
  }

  getTransform (rad, width) {
    var x = (0 - width / 2) * Math.cos(rad) - (0 - width / 2) * Math.sin(rad)
    var y = (0 - width / 2) * Math.sin(rad) + (0 - width / 2) * Math.cos(rad)

    return [ {translateX: (-1 * x) - width / 2}, {translateY: (-1 * y) + width / 2}, { rotate: rad + 'rad' } ]
  }

  drawCooridinate (key, start, end) {
    var dx = end[0] - start[0]
    var dy = end[1] - start[1]
    var size = Math.sqrt(dx * dx + dy * dy)
    var angleRad = -1 * Math.atan2(dy, dx)
    var height
    var top

    if (start[1] > end[1]) {
      height = start[1]
      top = -1 * size
    } else {
      height = end[1]
      top = -1 * (size - Math.abs(dy))
    }

    return (
      <View key={key} style={{ width: dx, height: height, marginTop: 20, marginBottom: 20 }}>
        <View style={{ top: top, width: size, height: size, borderColor: '#20B2AA', borderTopWidth: 1, transform: this.getTransform(angleRad, size) }} />
      </View>
    )
  }

  drawPoint (index, point) {
    var key = 'point' + index
    var size = 8
    var color = '#20B2AA'
    if (this.state.selectedIndex === index) {
      color = 'red'
    }
    return (
      <View key={key} style={{ width: size, height: size, borderRadius: 10, left: point[0] - size / 2 + 10, bottom: point[1] - size / 2 + 20, position: 'absolute', borderColor: color, backgroundColor: color, borderWidth: 1 }} />
    )
  }

  drawCoordinates (data) {
    var result = []
    var space = 1000

    for (var i = 0; i < data.length - 1; i++) {
      if (data[i][0] <= this.state.nowWidth + this.state.scrollPosition + space && data[i][0] >= this.state.scrollPosition - space) {
        result.push(this.drawCooridinate('line' + i, data[i], data[i + 1]))
      }
    }

    if (data.length > 1) {
      result.push(this.drawPoint(0, data[0]))
    }

    for (i = 0; i < data.length - 1; i++) {
      if (data[i][0] <= this.state.nowWidth + this.state.scrollPosition + space && data[i][0] >= this.state.scrollPosition - space) {
        result.push(this.drawPoint((i + 1), data[i + 1]))
      }
    }

    return result
  }

  getDistance (p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
  }

  handlePress (evt) {
    var x = Math.round(this.state.scrollPosition + evt.nativeEvent.pageX - this.state.nowX) - 20
    var y = Math.round(this.state.nowHeight - (evt.nativeEvent.pageY - this.state.nowY)) + 20
    var selectedIndex = null
    var min = 100000
    var tempIndex = 0

    for (var i = 0; i < this.state.sortedData.length; i++) {
      if (x < this.state.sortedData[i][0]) {
        tempIndex = i
        break
      }
    }

    var start = tempIndex - 5
    var end = tempIndex + 5
    if (start < 0) {
      start = 0
    }

    if (end > this.state.sortedData.length) {
      end = this.state.sortedData.length
    }

    for (i = start; i < end; i++) {
      var distance = this.getDistance([x, y], this.state.sortedData[i])
      if (distance < min) {
        min = distance
        selectedIndex = i
      }
    }

    selectedIndex = tempIndex

    this.setState({
      msg: `x coord = ${x}, ${y}, index: ${selectedIndex}, tempIndex: ${tempIndex}, minDistance: ${min}, ${this.state.nowX}, ${this.state.nowY}`,
      selectedIndex: selectedIndex
    })
  }

  drawSelected (index) {
    if (typeof (this.state.selectedIndex) === 'number' && this.state.selectedIndex >= 0) {
      return <View style={{ position: 'absolute', width: 1, height: '100%', left: this.state.sortedData[index][0] + 9.5, backgroundColor: 'red' }} />
    } else {
      return null
    }
  }

  drawYAxis () {
    return (
      <View style={{
        borderRightWidth: 1,
        borderColor: '#e0e0e0',
        width: 1,
        height: '100%',
        marginRight: 10

      }} />

    )
  }

  drawXAxis () {
    return (
      <View style={{
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0'
      }} />
    )
  }

  handleLayout (evt) {
    this.setState({
      nowHeight: evt.nativeEvent.layout.height,
      nowWidth: evt.nativeEvent.layout.width
    }, () => {
      this.refs.chartView.measure((ox, oy, width, height, px, py) => {
        this.setState({nowX: px, nowY: py})
      })
    })
  }

  handleScroll (evt) {
    this.setState({scrollPosition: evt.nativeEvent.contentOffset.x})
  }

  numberWithCommas (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  render () {
    return (
      this.state.sortedData.length > 0 ? (
        <View style={{flexDirection: 'row'}}>
          <View style={{
            paddingRight: 5
          }}>
            <Text style={{fontSize: 11}}>{this.numberWithCommas(this.state.max)}</Text>
          </View>

          <ScrollView horizontal onScroll={this.handleScroll}>
            <TouchableWithoutFeedback onPressIn={(evt) => this.handlePress(evt)} >
              <View style={{ paddingBottom: 20, paddingLeft: 0, paddingRight: 20 }}>
                <View>
                  <View ref='chartView' onLayout={this.handleLayout} style={{flexDirection: 'row', alignItems: 'flex-end', margin: 0, paddingRight: 30}}>
                    {this.drawYAxis()}
                    {this.drawCoordinates(this.state.sortedData)}
                    {this.drawSelected(this.state.selectedIndex)}
                  </View>
                  {this.drawXAxis()}
                </View>
              </View>

            </TouchableWithoutFeedback>
          </ScrollView >
        </View>
      ) : null

    )
  }
}

SimpleChart.defaultProps = {
  data: []
}

export default SimpleChart
