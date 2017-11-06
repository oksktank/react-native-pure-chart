import React from 'react'
import { View, TouchableWithoutFeedback, Text, Animated, Easing, ScrollView, StyleSheet } from 'react-native'
import {initData, drawYAxis, drawGuideLine, drawYAxisLabels, numberWithCommas, drawXAxis, drawXAxisLabels} from '../common'

class LineChart extends React.Component {
  constructor (props) {
    super(props)
    let newState = initData(this.props.data, this.props.height, this.props.gap)
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
    let x = (0 - width / 2) * Math.cos(rad) - (0 - width / 2) * Math.sin(rad)
    let y = (0 - width / 2) * Math.sin(rad) + (0 - width / 2) * Math.cos(rad)

    return [ {translateX: (-1 * x) - width / 2}, {translateY: (-1 * y) + width / 2}, { rotate: rad + 'rad' } ]
  }

  drawCooridinate (index, start, end, backgroundColor = '#FFFFFF00', isBlank = false, lastCoordinate = false) {
    let key = 'line' + index
    let dx = end.gap - start.gap
    let dy = end.ratioY - start.ratioY
    let size = Math.sqrt(dx * dx + dy * dy)
    let angleRad = -1 * Math.atan2(dy, dx)
    let height
    let top
    let topMargin = 20

    if (start.ratioY > end.ratioY) {
      height = start.ratioY
      top = -1 * size
    } else {
      height = end.ratioY
      top = -1 * (size - Math.abs(dy))
    }

    return (
      <View key={key} style={{
        height: this.props.height + topMargin,
        justifyContent: 'flex-end'
      }}>

        <View style={StyleSheet.flatten([{
          width: dx,
          height: height,
          marginTop: topMargin
        }, styles.coordinateWrapper])}>
          <View style={StyleSheet.flatten([{
            top: top,
            width: size,
            height: size,
            borderColor: isBlank ? backgroundColor : this.props.primaryColor,
            borderTopWidth: 1,
            transform: this.getTransform(angleRad, size)
          }, styles.lineBox])} />
          <View style={StyleSheet.flatten([styles.absolute, {
            height: height - Math.abs(dy) - 2,
            backgroundColor: lastCoordinate ? '#FFFFFF00' : backgroundColor,
            marginTop: Math.abs(dy) + 2
          }])} />
        </View>
        {!lastCoordinate ? (
          <View style={StyleSheet.flatten([styles.guideLine, {
            width: dx
          }])} />
        ) : null}

        <TouchableWithoutFeedback onPress={() => {
          let selectedIndex = lastCoordinate ? index - 1 : index
          this.setState({
            selectedIndex: selectedIndex
          }, () => {
            if (typeof this.props.onPointClick === 'function') {
              this.props.onPointClick()
            }
          })
        }}>
          <View style={StyleSheet.flatten([styles.absolute, {
            width: dx,
            marginLeft: -1 * dx / 2
          }])} />
        </TouchableWithoutFeedback>

      </View>
    )
  }

  drawPoint (index, point) {
    let key = 'point' + index
    let size = 8
    let color = this.props.primaryColor
    if (this.state.selectedIndex === index) {
      color = this.props.selectedColor
    }

    return (
      <TouchableWithoutFeedback key={key} onPress={() => {
        this.setState({selectedIndex: index})
      }}>
        <View style={StyleSheet.flatten([styles.pointWrapper, {
          width: size,
          height: size,

          left: point.gap - size / 2,
          bottom: point.ratioY - size / 2,

          borderColor: color,
          backgroundColor: color

        }])} />
      </TouchableWithoutFeedback>
    )
  }

  drawCoordinates (data) {
    let result = []

    let dataLength = data.length
    for (let i = 0; i < dataLength - 1; i++) {
      result.push(this.drawCooridinate(i, data[i], data[i + 1]))
    }

    let lastData = Object.assign({}, data[dataLength - 1])
    let lastCoordinate = Object.assign({}, data[dataLength - 1])
    lastCoordinate.gap = lastCoordinate.gap + this.props.gap
    result.push(this.drawCooridinate((dataLength), lastData, lastCoordinate, '#FFFFFF', true, true))

    if (dataLength > 1) {
      result.push(this.drawPoint(0, data[0]))
    }

    for (let i = 0; i < dataLength - 1; i++) {
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
      let reverse = true
      let bottom = this.state.sortedData[index].ratioY
      let width = 200
      let left = this.state.sortedData[index].gap - width / 2 + 1
      if (bottom > this.props.height * 2 / 3) {
        reverse = false
      }

      return (
        <View style={StyleSheet.flatten([styles.selectedWrapper, {
          width: width,
          left: left,
          justifyContent: reverse ? 'flex-start' : 'flex-end'
        }])}>
          <View style={StyleSheet.flatten([styles.selectedLine, {
            backgroundColor: this.props.selectedColor
          }])} />
          <View style={StyleSheet.flatten([styles.selectedBox, {
            height: this.state.sortedData[index].x ? 60 : 30
          }, reverse ? {
            marginTop: this.state.sortedData[index].x ? this.props.height - bottom - 45 : this.props.height - bottom - 15
          } : {
            marginBottom: this.state.sortedData[index].x ? bottom - 65 : bottom - 35
          }, index === 0 ? {
            marginLeft: width / 2 - 10
          } : index === this.state.sortedData.length - 1 ? {
            marginRight: width / 2 - 20
          } : {}])}>
            {this.state.sortedData[index].x ? (
              <Text style={styles.bold}>{this.state.sortedData[index].x}</Text>
            ) : null}
            <Text>{numberWithCommas(this.state.sortedData[index].y, false)}</Text>
          </View>

        </View>
      )
    } else {
      return null
    }
  }

  render () {
    let {fadeAnim} = this.state
    return (
      this.state.sortedData.length > 0 ? (
        <View style={styles.wrapper}>

          <View style={styles.yAxisLabelsWrapper}>
            {drawYAxisLabels(this.state.guideArray, this.props.height + 20)}

          </View>

          <View>
            <ScrollView horizontal>
              <View>

                <View ref='chartView' style={styles.chartViewWrapper}>

                  {drawYAxis()}
                  {drawGuideLine(this.state.guideArray)}
                  <Animated.View style={{
                    transform: [{scaleY: fadeAnim}],
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    height: '100%'
                  }} >
                    {this.drawCoordinates(this.state.sortedData)}
                  </Animated.View>
                  {this.drawSelected(this.state.selectedIndex)}

                </View>

                {drawXAxis()}
                {drawXAxisLabels(this.state.sortedData, this.props.gap)}
              </View>

            </ScrollView>
          </View>

        </View>
      ) : null

    )
  }
}

LineChart.defaultProps = {
  data: [],
  primaryColor: '#297AB1',
  selectedColor: '#FF0000',
  height: 100,
  gap: 50,
  onPointClick: (point) => {

  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row'
  },
  yAxisLabelsWrapper: {
    paddingRight: 5
  },
  chartViewWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 0,
    paddingRight: 0
  },
  coordinateWrapper: {
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignContent: 'flex-start'
  },
  lineBox: {
    overflow: 'hidden',
    justifyContent: 'flex-start'
  },
  guideLine: {
    position: 'absolute',
    height: '100%',
    borderRightColor: '#e0e0e050',
    borderRightWidth: 1
  },
  absolute: {
    position: 'absolute',
    width: '100%'
  },
  pointWrapper: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: 1
  },
  selectedWrapper: {
    position: 'absolute',
    height: '100%',
    alignItems: 'center'
  },
  selectedLine: {
    position: 'absolute',
    width: 1,
    height: '100%'
  },
  selectedBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderColor: '#AAAAAA',
    borderWidth: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bold: {fontWeight: 'bold'}
})

export default LineChart
