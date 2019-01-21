import React from 'react'
import { View, TouchableWithoutFeedback, Text, Animated, Easing, ScrollView, StyleSheet, Dimensions } from 'react-native'
import {initData, drawYAxis, drawGuideLine, drawXAxisLabels, drawYAxisLabels, numberWithCommas, drawXAxis, drawYAxisRightLabels, drawYLeftAxisLabels} from '../common'

class LineChart extends React.Component {
  constructor (props) {
    super(props)
    let newState = initData(this.props.data, this.props.height, this.props.gap, this.props.numberOfYAxisGuideLine,this.props.minY,this.props.maxY)
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
      minY: this.props.minY,
      maxY: this.props.maxY,
      fadeAnim: new Animated.Value(0),
      guideArray: newState.guideArray,
      showRightLablelCol: this.props.showRightLablelCol
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
      }, initData(nextProps.data, this.props.height, this.props.gap, this.props.numberOfYAxisGuideLine,nextProps.minY,nextProps.maxY)), () => {
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
    let angleRad = Math.atan2(dy, dx) == 0 ? 0 : -1 * Math.atan2(dy, dx)
    let height
    let top
    let topMargin = 20
    if (lastCoordinate) {
      dx = dx/3
    }
    if (start.ratioY > end.ratioY) {
      height = start.ratioY
      top = -1 * size
    } else {
      height = end.ratioY
      top = -1 * (size - Math.abs(dy))
    }
    backgroundColor = 'rgba(255,255,255,0)'
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
            borderTopWidth: 3,
            transform: this.getTransform(angleRad, size)
          }, styles.lineBox, lineStyle])} />
          <View style={StyleSheet.flatten([styles.absolute, {
            height: height - Math.abs(dy) - 2,
            backgroundColor: lastCoordinate ? 'rgba(255,255,255,0)' : backgroundColor,
            marginTop: Math.abs(dy) + 2
          }])} />
        </View>
        {!lastCoordinate && seriesIndex === 0 ? (
          <View style={StyleSheet.flatten([styles.guideLine, {
            width: dx,
            borderRightColor: this.props.xAxisGridLineColor
          }])} />
        ) : null}
        {seriesIndex === this.state.sortedData.length - 1 && (
          <TouchableWithoutFeedback onPress={() => {
            let selectedIndex = lastCoordinate ? index - 1 : index

            let emptyCount = 0
            this.state.sortedData.map((series) => {
              if (series.data[selectedIndex].isEmpty) emptyCount++
            })
            if (emptyCount === this.state.sortedData.length) {
              return null
            }

            this.setState({
              selectedIndex: selectedIndex
            }, () => {
              if (typeof this.props.onPress === 'function') {
                this.props.onPress(selectedIndex)
              }
            })
          }}>
            <View style={{
              width: dx,
              height: '100%',
              position: 'absolute',
              marginLeft: -1 * dx / 2,
              backgroundColor: 'rgba(255,255,255,0)'
            }} />
          </TouchableWithoutFeedback>
        )}

      </View>
    )
  }

  drawPoint (index, point, seriesColor, isTarget = false) {
    let key = 'point' + index
    let size = 18
    let color = !seriesColor ? this.props.primaryColor : seriesColor
    if (this.state.selectedIndex === index) {
      color = this.props.selectedColor
    }

    if (point.isEmpty || this.props.hidePoints) return null
    if (isTarget) {
      return (
        <TouchableWithoutFeedback key={key} onPress={() => {
          this.setState({selectedIndex: index})
        }}>

          <View style={StyleSheet.flatten([styles.pointWrapperTarget, {
            width: 18,
            height: 3,

            left: point.gap - size / 2,
            bottom: point.ratioY - size / 2 + 6,

            borderColor: color,
            backgroundColor: color

          }])} />
        </TouchableWithoutFeedback>
      )
    } else {
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
  }
  drawValue (index, point) {
    let key = 'pointvalue' + index
    let size = 200
    return (

      <View key={key} style={{
        position: 'absolute',
        left: index === 0 ? point.gap : point.gap - size / 2,
        bottom: point.ratioY + 10,
        backgroundColor: 'transparent',
        width: index !== 0 ? 200 : undefined

      }} >
        {this.drawCustomValue(index, point)}

      </View>

    )
  }

  drawCustomValue (index, point) {
    if (this.props.customValueRenderer) {
      return this.props.customValueRenderer(index, point)
    } else {
      return null
    }
  }
  drawCoordinates (data, seriesColor, seriesIndex, isTarget = false, lastIsBlank = false) {
    let result = []
    let lineStyle = {
      borderColor: !seriesColor ? this.props.primaryColor : seriesColor
      //borderColor: "blue"
    }
    let dataLength = data.length
    for (let i = 0; i < dataLength - 1; i++) {
      let styleDetail = {
        borderColor: data[i] && data[i].color ? data[i].color : lineStyle.borderColor
      }
      if ((data[i] && data[i].color && data[i].color == 'rgba(255,255,255,0)') || data[i + 1] && data[i + 1].color && data[i + 1].color == 'rgba(255,255,255,0)') {
        styleDetail = {
          borderColor: 'rgba(255,255,255,0)'
        }
      }
      result.push(this.drawCoordinate(i, data[i], data[i + 1], 'rgba(255,255,255,0)', styleDetail, false, false, seriesIndex))
    }

    if (dataLength > 0) {
      //result.push(this.drawPoint(0, data[0], seriesColor, isTarget))
      result.push(this.drawValue(0, data[0], seriesColor))
    }

    for (let i = 0; i < dataLength - 1; i++) {
      result.push(this.drawPoint((i + 1), data[i + 1], seriesColor, isTarget))
      result.push(this.drawValue((i + 1), data[i + 1], seriesColor))
    }

    let lastData = Object.assign({}, data[dataLength - 1])
    let lastCoordinate = Object.assign({}, data[dataLength - 1])
    lastCoordinate.gap = lastCoordinate.gap + this.props.gap
    let customStyle = {
      borderColor: data[0] && data[0].color ? data[0].color : lineStyle.borderColor
    }
    if (lastIsBlank) {
      result.push(this.drawCoordinate((dataLength), lastData, lastCoordinate, 'rgba(255,255,255,0)', {}, true, true, seriesIndex))
    } else {
      result.push(this.drawCoordinate((dataLength), lastData, lastCoordinate, 'rgba(255,255,255,0)', customStyle, false, true, seriesIndex))
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

      let left = dataObject.gap
      let gap = 0
      if (index === data.length - 1 && index !== 0) {
        left = data[index - 1].gap
        gap = dataObject.gap - left
      }
      if (bottom > this.props.height * 2 / 3) {
        reverse = false
      }

      return (
        <View style={StyleSheet.flatten([styles.selectedWrapper, {
          left: left,
          justifyContent: 'center'
        }])}>
          <View style={StyleSheet.flatten([styles.selectedLine, {
            backgroundColor: this.props.selectedColor,
            marginLeft: gap
          }])} />

          <View style={StyleSheet.flatten([styles.selectedBox])}>
            {this.state.sortedData.map((series) => {
              let dataObject = series.data[this.state.selectedIndex]
              return (
                <View key={series.seriesName}>
                  {dataObject.x ? (
                      <Text style={styles.tooltipTitle}>{series.seriesLabel ? series.seriesLabel :dataObject.x}</Text>
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
    let marginRight = 10
    if (this.state.showRightLablelCol) {
      marginRight = 0
    }
    return (
      this.state.sortedData.length > 0 ? (
        <View style={StyleSheet.flatten([styles.wrapper, {
          backgroundColor: "transparent"
        }])}>


          <View style={styles.yAxisLabelsWrapper}>
            {drawYAxisLabels(this.state.guideArray, this.props.height + 20, this.props.minValue, this.props.labelColor)}
          </View>

          <View style={{
            flex: 1,
            marginRight: marginRight
          }}>
            <ScrollView horizontal style={{
              flex: 1,
            }}>
              <View style={{
                flex: 1,
              }}>

                <View ref='chartView' style={styles.chartViewWrapper}>

                  {drawYAxis(this.props.yAxisColor)}
                  {drawGuideLine(this.state.guideArray, this.props.yAxisGridLineColor)}
                  {this.state.sortedData.map((obj, index) => {
                    return (
                      <Animated.View key={'animated_' + index} style={{
                        transform: [{scaleY: fadeAnim}],
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        height: '100%',
                        position: index === 0 ? 'relative' : 'absolute',
                        minWidth: 200,
                        marginBottom: this.props.minValue && this.state.guideArray && this.state.guideArray.length > 0 ? -1 * this.state.guideArray[0][2] * this.props.minValue : null
                      }} >
                        {this.drawCoordinates(obj.data, obj.seriesColor, index, obj.isTarget, obj.lastIsBlank)}
                      </Animated.View>
                    )
                  })}
                  {this.drawSelected(this.state.selectedIndex)}

                </View>

                {drawXAxis(this.props.xAxisColor)}
                {drawXAxisLabels(this.state.sortedData[0].data, this.props.gap, this.props.labelColor, this.props.showEvenNumberXaxisLabel)}
              </View>

            </ScrollView>
          </View>

          {
            this.state.showRightLablelCol ? (
                <View style={styles.yAxisRightLabelsWrapper}>
                {drawYAxisRightLabels(this.state.guideArray, this.props.height + 20, this.props.minValue, this.props.labelColor)}
          </View>
          ) : null
          }
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
  gap: 60,
  showEvenNumberXaxisLabel: true,
  onPointClick: (point) => {

  },
  numberOfYAxisGuideLine: 5
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    overflow: 'hidden',
    flex: 1,
    justifyContent: 'space-between'
  },
  yAxisLabelsWrapper: {
    paddingRight: 5
  },
  yAxisRightLabelsWrapper: {
    width: 35,
    marginLeft: 5
  },
  chartViewWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 0,
    paddingRight: 0
    //overflow: 'hidden',
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
  pointWrapperTarget: {
    position: 'absolute',
    borderRadius: 0,
    borderWidth: 1
  },
  selectedWrapper: {
    position: 'absolute',
    height: '100%',
    alignItems: 'flex-start'
  },
  selectedLine: {
    position: 'absolute',
    width: 1,
    height: '100%'
  },
  selectedBox: {
    backgroundColor: '#164103',
    borderRadius: 5,
    opacity: 0.8,
    borderColor: '#AAAAAA',
    borderWidth: 1,
    position: 'absolute',
    padding: 3,
    marginLeft: 5,
    justifyContent: 'center'
  },
  tooltipTitle: {fontSize: 10, color: 'white'},
  tooltipValue: {fontWeight: 'bold', fontSize: 15, color: 'white'}
})

export default LineChart
