import React from 'react'
import { View, TouchableWithoutFeedback, Text, Animated, Easing, ScrollView } from 'react-native'
import {initData, drawYAxis, drawGuideText, drawGuideLine, numberWithCommas} from '../common'

class LineChart extends React.Component {
  constructor (props) {
    super(props)
    var newState = initData(this.props.data, this.props.height, this.props.gap)
    this.state = {
      loading: false,
      sortedData: newState.sortedData,
      selectedIndex: null,
      nowHeight: 200,
      nowWidth: 200,
      scrollPosition: 0,
      nowX: 0,
      nowY: 0,
      max: newState.max,
      fadeAnim: new Animated.Value(0),
      guideArray: newState.guideArray
    }

    this.drawCoordinates = this.drawCoordinates.bind(this)
    this.drawCooridinate = this.drawCooridinate.bind(this)
    this.drawSelected = this.drawSelected.bind(this)

    this.drawLabels = this.drawLabels.bind(this)
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

  componentDidMount () {
    Animated.timing(this.state.fadeAnim, { toValue: 1, easing: Easing.bounce, duration: 1000, useNativeDriver: true }).start()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(Object.assign({
        fadeAnim: new Animated.Value(0)
      }, initData(nextProps.data, this.props.height, this.props.gap)), () => {
        Animated.timing(this.state.fadeAnim, { toValue: 1, easing: Easing.bounce, duration: 1000, useNativeDriver: true }).start()
      })
    }
  }

  getTransform (rad, width) {
    var x = (0 - width / 2) * Math.cos(rad) - (0 - width / 2) * Math.sin(rad)
    var y = (0 - width / 2) * Math.sin(rad) + (0 - width / 2) * Math.cos(rad)

    return [ {translateX: (-1 * x) - width / 2}, {translateY: (-1 * y) + width / 2}, { rotate: rad + 'rad' } ]
  }

  drawCooridinate (index, start, end, backgroundColor = '#FFFFFF00', isBlank = false, lastCoordinate = false) {
    var key = 'line' + index
    var dx = end[0] - start[0]
    var dy = end[1] - start[1]
    var size = Math.sqrt(dx * dx + dy * dy)
    var angleRad = -1 * Math.atan2(dy, dx)
    var height
    var top
    var topMargin = 20

    if (start[1] > end[1]) {
      height = start[1]
      top = -1 * size
    } else {
      height = end[1]
      top = -1 * (size - Math.abs(dy))
    }

    return (
      <View key={key} style={{
        height: this.props.height + topMargin,
        justifyContent: 'flex-end'
      }}>

        <View style={{
          width: dx,
          height: height,
          marginTop: topMargin,
          overflow: 'hidden',
          justifyContent: 'flex-start',
          alignContent: 'flex-start'
        }}>
          <View style={{
            top: top,
            width: size,
            height: size,
            borderColor: isBlank ? backgroundColor : this.props.primaryColor,
            borderTopWidth: 1,
            transform: this.getTransform(angleRad, size),

            overflow: 'hidden',
            justifyContent: 'flex-start'}} />
          <View style={{
            position: 'absolute',
            height: height - Math.abs(dy) - 2,
            width: '100%',
            backgroundColor: lastCoordinate ? '#FFFFFF00' : backgroundColor,
            marginTop: Math.abs(dy) + 2
          }} />
        </View>
        {!lastCoordinate ? (
          <View style={{
            position: 'absolute',
            height: '100%',
            width: dx,
            borderRightColor: '#e0e0e050',
            borderRightWidth: 1
          }} />
        ) : null}

        <TouchableWithoutFeedback onPress={() => {
          console.log('index', index)
          this.setState({

            selectedIndex: lastCoordinate ? index - 1 : index
          })
        }}>
          <View style={{
            position: 'absolute',
            height: '100%',
            width: dx,
            marginLeft: -1 * dx / 2
          }} />
        </TouchableWithoutFeedback>

      </View>
    )
  }

  drawPoint (index, point) {
    var key = 'point' + index
    var size = 8
    var color = this.props.primaryColor
    if (this.state.selectedIndex === index) {
      color = 'red'
    }

    return (
      <TouchableWithoutFeedback key={key} onPress={() => {
        this.setState({selectedIndex: index})
      }}>
        <View style={{
          width: size,
          height: size,
          borderRadius: 10,
          left: point[0] - size / 2,
          bottom: point[1] - size / 2,
          position: 'absolute',
          borderColor: color,
          backgroundColor: color,
          borderWidth: 1
        }} />
      </TouchableWithoutFeedback>
    )
  }

  drawCoordinates (data) {
    var result = []

    for (var i = 0; i < data.length - 1; i++) {
      result.push(this.drawCooridinate(i, data[i], data[i + 1]))
    }
    var lastData = data[data.length - 1].slice(0)
    var lastCoordinate = data[data.length - 1].slice(0)
    lastCoordinate[0] = lastCoordinate[0] + this.props.gap
    result.push(this.drawCooridinate((i + 1), lastData, lastCoordinate, '#FFFFFF', true, true))

    if (data.length > 1) {
      result.push(this.drawPoint(0, data[0]))
    }

    for (i = 0; i < data.length - 1; i++) {
      result.push(this.drawPoint((i + 1), data[i + 1]))
    }

    return result
  }

  getDistance (p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
  }

  drawSelected (index) {
    if (typeof (this.state.selectedIndex) === 'number' && this.state.selectedIndex >= 0) {
      if (!this.state.sortedData[index]) {
        return null
      }
      var reverse = true
      var bottom = this.state.sortedData[index][1]
      var width = 200
      var left = this.state.sortedData[index][0] - width / 2 + 1
      if (bottom > this.props.height * 2 / 3) {
        reverse = false
      }

      return (
        <View style={{
          position: 'absolute',
          height: '100%',
          width: width,
          left: left,
          alignItems: 'center',
          justifyContent: reverse ? 'flex-start' : 'flex-end'
        }}>
          <View style={{
            position: 'absolute',
            width: 1,
            height: '100%',
            backgroundColor: 'red' }} />
          <View style={Object.assign({
            backgroundColor: '#FFFFFF',
            borderRadius: 5,
            borderColor: '#AAAAAA',
            borderWidth: 1,
            height: this.state.sortedData[index][3] ? 60 : 30,
            padding: 3,
            alignItems: 'center',
            justifyContent: 'center'
          }, reverse ? {
            marginTop: this.state.sortedData[index][3] ? this.props.height - bottom - 45 : this.props.height - bottom - 15
          } : {
            marginBottom: this.state.sortedData[index][3] ? bottom - 65 : bottom - 35
          }, index === 0 ? {
            marginLeft: width / 2 - 10
          } : index === this.state.sortedData.length - 1 ? {
            marginRight: width / 2 - 20
          } : {})}>
            {this.state.sortedData[index][3] ? (
              <Text style={{fontWeight: 'bold'}}>{this.state.sortedData[index][3]}</Text>
            ) : null}
            <Text>{numberWithCommas(this.state.sortedData[index][2], false)}</Text>
          </View>

        </View>
      )
    } else {
      return null
    }
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
  drawLabels () {
    return (
      <View style={{
        width: '100%',
        paddingVertical: 10,
        height: 10
      }}>
        {this.state.sortedData.map((data, i) => {
          if (data[3] && i % 2 === 1) {
            return (
              <View key={'label' + i} style={{
                position: 'absolute',
                left: data[0] - this.props.gap / 2,
                width: this.props.gap
              }}>
                <Text style={{fontSize: 9}}>{data[3]}</Text>
              </View>
            )
          } else {
            return null
          }
        })}
      </View>
    )
  }

  render () {
    let {fadeAnim} = this.state
    return (
      this.state.sortedData.length > 0 ? (
        <View style={{flexDirection: 'row'}}>
          <View style={{
            paddingRight: 5
          }}>
            {drawGuideText(this.state.guideArray, this.props.height + 20)}

          </View>

          <View style={{ paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
            <View>
              <ScrollView horizontal>
                <View ref='chartView' style={{flexDirection: 'row', alignItems: 'flex-end', margin: 0, paddingRight: 0}}>

                  {drawYAxis()}
                  {drawGuideLine(this.state.guideArray)}
                  <Animated.View style={{ transform: [{scaleY: fadeAnim}], flexDirection: 'row', alignItems: 'flex-end', height: '100%' }} >
                    {this.drawCoordinates(this.state.sortedData)}
                  </Animated.View>
                  {this.drawSelected(this.state.selectedIndex)}

                </View>

                {this.drawXAxis()}
              </ScrollView>
            </View>

            {this.drawLabels()}

          </View>

        </View>
      ) : null

    )
  }
}

LineChart.defaultProps = {
  data: [],
  primaryColor: '#297AB1',
  height: 100,
  gap: 50
}

export default LineChart
