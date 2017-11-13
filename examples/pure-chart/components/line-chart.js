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
    this.drawCoordinate = this.drawCoordinate.bind(this)
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

  drawCoordinate (index, start, end, backgroundColor, lineStyle, isBlank, lastCoordinate, seriesIndex) {
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
          }, styles.lineBox, lineStyle])} />
          <View style={StyleSheet.flatten([styles.absolute, {
            height: height - Math.abs(dy) - 2,
            backgroundColor: lastCoordinate ? '#FFFFFF00' : backgroundColor,
            marginTop: Math.abs(dy) + 2
          }])} />
        </View>
        {!lastCoordinate && seriesIndex === 0 ? (
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
          <View style={{
            width: dx,
            height: '100%',
            position: 'absolute',
            marginLeft: -1 * dx / 2
          }} />
        </TouchableWithoutFeedback>

      </View>
    )
  }

  drawPoint (index, point, seriesColor) {
    let key = 'point' + index
    let size = 8
    let color = !seriesColor ? this.props.primaryColor : seriesColor
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

  drawCoordinates (data, seriesColor, seriesIndex) {
    let result = []
    let lineStyle = {
      borderColor: !seriesColor ? this.props.primaryColor : seriesColor
    }
    let dataLength = data.length
    for (let i = 0; i < dataLength - 1; i++) {
      result.push(this.drawCoordinate(i, data[i], data[i + 1], '#FFFFFF00', lineStyle, false, false, seriesIndex))
    }

    let lastData = Object.assign({}, data[dataLength - 1])
    let lastCoordinate = Object.assign({}, data[dataLength - 1])
    lastCoordinate.gap = lastCoordinate.gap + this.props.gap
    result.push(this.drawCoordinate((dataLength), lastData, lastCoordinate, '#FFFFFF', {}, true, true, seriesIndex))

    if (dataLength > 1) {
      result.push(this.drawPoint(0, data[0], seriesColor))
    }

    for (let i = 0; i < dataLength - 1; i++) {
      result.push(this.drawPoint((i + 1), data[i + 1], seriesColor))
    }

    return result
  }

  getDistance (p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
  }

  drawSelected (index) {
    if (this.state.sortedData.length === 0) return null
    let data = this.state.sortedData[0].data
    let dataObject = data[index]
    if (typeof (this.state.selectedIndex) === 'number' && this.state.selectedIndex >= 0) {
      if (!dataObject) {
        return null
      }
      let reverse = true
      let bottom = dataObject.ratioY
      let width = 200
      let left = dataObject.gap - width / 2 + 1
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

          }, reverse ? {

          } : {

          }, index === 0 ? {
            marginLeft: width / 2 - 10
          } : index === data.length - 1 ? {
            marginRight: width / 2 - 20
          } : {}])}>
            {this.state.sortedData.map((series) => {
              let dataObject = series.data[this.state.selectedIndex]
              return (
                <View key={series.seriesName}>
                  {dataObject.x ? (
                    <Text style={styles.tooltipTitle}>{dataObject.x}</Text>
                ) : null}
                  <View style={{flexDirection: 'row', paddingLeft: 5, alignItems: 'center'}}>
                    <View style={{
                      width: 10,
                      height: 5,
                      marginRight: 3,
                      borderRadius: 2,
                      backgroundColor: !series.seriesColor ? this.props.primaryColor : series.seriesColor
                    }} />
                    <Text style={styles.tooltipValue}>{numberWithCommas(dataObject.y, false)}</Text>
                  </View>
                </View>
              )
            })}

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
                  {this.state.sortedData.map((obj, index) => {
                    return (
                      <Animated.View key={'animated_' + index} style={{
                        transform: [{scaleY: fadeAnim}],
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        height: '100%',
                        position: index === 0 ? 'relative' : 'absolute'
                      }} >
                        {this.drawCoordinates(obj.data, obj.seriesColor, index)}
                      </Animated.View>
                    )
                  })}
                  {this.drawSelected(this.state.selectedIndex)}

                </View>

                {drawXAxis()}
                {drawXAxisLabels(this.state.sortedData[0].data, this.props.gap)}
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
    flexDirection: 'row',
    backgroundColor: '#FFFFFF'
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
    justifyContent: 'center'
  },
  tooltipTitle: {fontSize: 10},
  tooltipValue: {fontWeight: 'bold', fontSize: 15}
})

export default LineChart
