import React from 'react'
import { View, ScrollView, LayoutAnimation, TouchableWithoutFeedback, Text, UIManager } from 'react-native'

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)

class SimpleChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      sortedData: [],
      selectedIndex: null,
      nowHeight: 200,
      nowWidth: 200,
      scrollPosition: 0,
      nowX: 0,
      nowY: 0
    }
    this.drawCoordinates = this.drawCoordinates.bind(this)
    this.drawSelected = this.drawSelected.bind(this)
    this.handlePress = this.handlePress.bind(this)
    this.handleLayout = this.handleLayout.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
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

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
      var sortedData = nextProps.data.sort((a, b) => { return a[0] - b[0] })
      this.setState({loading: true, sortedData: sortedData})
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
      <View key={key} style={{ width: size, height: size, borderRadius: 10, left: point[0] - size / 2 + 30, bottom: point[1] - size / 2 + 20, position: 'absolute', borderColor: color, backgroundColor: color, borderWidth: 1 }} />
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
<<<<<<< HEAD
    var x = Math.round(this.state.scrollPosition + evt.nativeEvent.locationX - this.state.nowX) - 30
    var y = Math.round(this.state.nowHeight - (evt.nativeEvent.locationY - this.state.nowY)) + 20
=======
    var x = Math.round(this.state.scrollPosition + evt.nativeEvent.pageX) - 60
    var y = Math.round(this.state.nowHeight - evt.nativeEvent.pageY) + 20
>>>>>>> develop
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
      msg: `x coord = ${x}, ${y}, index: ${selectedIndex}, tempIndex: ${tempIndex}, minDistance: ${min}`,
      selectedIndex: selectedIndex
    })
  }

  drawSelected (index) {
    if (typeof (this.state.selectedIndex) === 'number' && this.state.selectedIndex >= 0) {
      return <View style={{ position: 'absolute', width: 1, height: '100%', left: this.state.sortedData[index][0] + 29.5, backgroundColor: 'red' }} />
    } else {
      return null
    }
  }

  drawYAxis () {
    return (
      <View style={{
        borderLeftWidth: 1,
        borderColor: '#000000',
        width: 1,
        height: '100%',
        marginRight: 30

      }} />
    )
  }

  drawXAxis () {
    return (
      <View style={{
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#000000'
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

  render () {
    return (
      <View ref='chartView'
        onLayout={this.handleLayout}
        style={this.state.loading ? { backgroundColor: '#FFFFFF50' } : { backgroundColor: '#FFFFFF99' }}>

        <ScrollView horizontal onScroll={this.handleScroll}>
          <TouchableWithoutFeedback onPressIn={(evt) => this.handlePress(evt)} >
            <View style={{ paddingBottom: 20, paddingLeft: 20, paddingRight: 20 }}>
<<<<<<< HEAD
              <View ref='chartView' style={{flexDirection: 'row', alignItems: 'flex-end', margin: 0}}>
=======
              <View style={{flexDirection: 'row', alignItems: 'flex-end', margin: 0, paddingRight: 30}}>
                {this.drawYAxis()}
>>>>>>> develop
                {this.drawCoordinates(this.state.sortedData)}
                {this.drawSelected(this.state.selectedIndex)}
              </View>
              {this.drawXAxis()}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView >
        <Text>{this.state.msg}</Text>
      </View>
    )
  }
}

SimpleChart.defaultProps = {
  data: []
}

export default SimpleChart
