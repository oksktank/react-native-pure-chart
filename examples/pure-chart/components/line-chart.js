import React from "react";
import {
  View,
  TouchableWithoutFeedback,
  Text,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  initData,
  drawYAxis,
  drawGuideLine,
  drawYAxisLabels,
  numberWithCommas,
  drawXAxis,
  drawXAxisLabels,
} from "../common";

class LineChart extends React.Component {
  constructor(props) {
    super(props);
    //new state generated from initData function in common.js
    //data => array of objects (symmptom: symptom, time: time, x: date, y: comment,value)
    //height => 350 in our test, default 100
    //gap => default 60
    //numberOfYAxisGuideLine => default 5
    let newState = initData(
      this.props.data,
      this.props.height,
      this.props.gap,
      this.props.numberOfYAxisGuideLine
    );
    //newState => sortedData array, max data point, nowWidth (200), nowHeight (200), scrollPosition/nowX/nowY (0), guideArray
    // program state containing sortedData, max value, guideArray, and other info
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
      lineThickness:
        this.props.lineThickness > 10 ? 10 : this.props.lineThickness,
      fadeAnim: new Animated.Value(0),
      guideArray: newState.guideArray,
      startMarker: {},
      endMarker: {},
    };
    this.scrollView = null;

    this.drawCoordinates = this.drawCoordinates.bind(this);
    this.drawCoordinate = this.drawCoordinate.bind(this);
    this.drawSelected = this.drawSelected.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextState.sortedData !== this.state.sortedData ||
      nextState.selectedIndex !== this.state.selectedIndex ||
      nextState.scrollPosition !== this.state.scrollPosition ||
      nextState.startMarker !== this.state.startMarker ||
      nextState.endMarker !== this.state.endMarker
    ) {
      return true;
    } else {
      return false;
    }
  }

  componentDidUpdate(nextProps, nextState) {
    if (this.scrollView != null && nextState.max == 0) {
      setTimeout(
        () => this.scrollView.scrollTo(this.props.initialScrollPosition),
        this.props.initialScrollTimeOut
      );
    }
  }

  //runs after comonent mounts
  componentDidMount() {
    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      easing: Easing.bounce,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    if (this.scrollView != null) {
      setTimeout(
        () => this.scrollView.scrollTo(this.props.initialScrollPosition),
        this.props.initialScrollTimeOut
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(
        Object.assign(
          {
            fadeAnim: new Animated.Value(0),
          },
          initData(
            nextProps.data,
            this.props.height,
            this.props.gap,
            this.props.numberOfYAxisGuideLine
          )
        ),
        () => {
          Animated.timing(this.state.fadeAnim, {
            toValue: 1,
            easing: Easing.bounce,
            duration: 1000,
            useNativeDriver: true,
          }).start();
        }
      );
    }
  }

  getTransform(rad, width, direction) {
    let x = (0 - width / 2) * Math.cos(rad) - (0 - width / 2) * Math.sin(rad);
    let y = (0 - width / 2) * Math.sin(rad) + (0 - width / 2) * Math.cos(rad);
    let translateX = -1 * x - width / 2;
    if (direction === "lower")
      translateX = translateX + this.state.lineThickness;
    return [
      { translateX: translateX },
      { translateY: -1 * y + width / 2 },
      { rotate: rad + "rad" },
    ];
  }

  //function which takes two neighbouring co-ordinates and draws a line between them
  //this function is ONLY concerned with the line
  drawCoordinate(
    index,
    start,
    end,
    backgroundColor,
    lineStyle,
    isBlank,
    lastCoordinate,
    seriesIndex
  ) {
    let key = "line" + index;
    let dx = end.gap - start.gap;
    let dy = end.ratioY - start.ratioY;
    //caculate line size (pythagoras)
    let size = Math.sqrt(dx * dx + dy * dy);
    //calculate angle for line
    let angleRad = -1 * Math.atan2(dy, dx);
    let height;
    let top;
    let topMargin = 20;
    let direction;

    //figure out height and direction of line
    if (start.ratioY > end.ratioY) {
      direction = "lower";
      height = start.ratioY;
      top = -1 * size - (this.state.lineThickness - 2);
    } else {
      direction = "upper";
      height = end.ratioY;
      top = -1 * (size - Math.abs(dy)) - (this.state.lineThickness - 1.3);
    }

    return (
      // main container
      <View
        key={key}
        style={{
          height: this.props.height + topMargin,
          justifyContent: "flex-end",
        }}
      >
        {/* styling */}
        <View
          style={StyleSheet.flatten([
            {
              width: dx,
              height: height,
              marginTop: topMargin,
            },
            styles.coordinateWrapper,
          ])}
        >
          <View
            style={StyleSheet.flatten([
              {
                top: top,
                width: size,
                height: size,
                borderColor: isBlank
                  ? backgroundColor
                  : this.props.primaryColor,
                borderTopWidth: this.state.lineThickness,
                transform: this.getTransform(angleRad, size, direction),
              },
              styles.lineBox,
              lineStyle,
            ])}
          />
          <View
            style={StyleSheet.flatten([
              styles.absolute,
              {
                height: height - Math.abs(dy) - 2,
                backgroundColor: lastCoordinate ? "#FFFFFF00" : backgroundColor,
                marginTop: Math.abs(dy) + 2,
              },
            ])}
          />
        </View>
        {/* this does nothing */}
        {!lastCoordinate && seriesIndex === 0
          ? null
          : // <View style={StyleSheet.flatten([styles.guideLine, {
            //   width: dx,
            //   borderRightColor: this.props.xAxisGridLineColor
            // }])} />
            null}

        {/* if it's the final index */}
        {seriesIndex === this.state.sortedData.length - 1 && (
          //touchable component for the LINE between components
          <TouchableWithoutFeedback
            onPress={() => {
              let selectedIndex = lastCoordinate ? index - 1 : index;

              let emptyCount = 0;
              this.state.sortedData.map(series => {
                if (series.data[selectedIndex].isEmpty) {
                  emptyCount++;
                }
              });
              if (emptyCount === this.state.sortedData.length) {
                return null;
              }

              this.setState(
                {
                  selectedIndex: selectedIndex,
                },
                () => {
                  if (typeof this.props.onPress === "function") {
                    //pass the selectedIndex into the onPress function
                    // this.props.onPress(selectedIndex);
                  }
                }
              );
            }}
            onLongPress={() => {
              // let selectedIndex = lastCoordinate ? index - 1 : index;
              // if (typeof this.props.onLongPressSelected === "function") {
              //   const selectedData = this.state.sortedData.map(series => {
              //     return series.data[selectedIndex];
              //   });
              //making this print the data
              //pass the selectedIndex's data into the onLongPress function
              // this.props.onLongPress(selectedData);
            }}
          >
            {/* styling */}
            <View
              style={{
                width: dx,
                height: "100%",
                position: "absolute",
                marginLeft: (-1 * dx) / 2,
                backgroundColor: "#FFFFFF01",
              }}
            />
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  }

  //generates
  drawPoint(index, point, seriesColor) {
    //unique key
    let key = "point" + index;
    let size = 8;
    let color = !seriesColor ? this.props.primaryColor : seriesColor;
    //colour if comment
    if (point.y.comment) {
      color = "#00FF00";
    }

    //when clicked on, change colour
    if (this.state.selectedIndex === index) {
      color = this.props.selectedColor;
    }

    if (point.isEmpty || this.props.hidePoints) return null;

    //return touchable styled component (co-ordinate marker)
    return (
      <TouchableWithoutFeedback
        key={key}
        onPress={() => {
          this.setState({ selectedIndex: index });
        }}
        onLongPress={() => {
          const selectedData = this.state.sortedData.map(series => {
            return series.data[index];
          });
          if (this.state.selectedIndex === index) {
            this.props.onSelectedPointLongPress(selectedData);
          } else {
            this.updateMarkers(selectedData);
          }
        }}
        hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }}
      >
        <View
          style={StyleSheet.flatten([
            styles.pointWrapper,
            {
              width: size + this.state.lineThickness - 2,
              height: size + this.state.lineThickness - 2,

              left: point.gap - size / 2,
              bottom: point.ratioY - size / 2,

              borderColor: this.shouldShowMarker(index) ? "black" : color,
              backgroundColor: color,
            },
          ])}
        >
          {this.shouldShowMarker(index) ? (
            <View style={{ flex: 1 }}>
              {/* series colour */}
              <View
                style={{
                  width: 10,
                  height: 5,
                  marginRight: 3,
                  borderRadius: 2,
                }}
              />
            </View>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  updateMarkers(data) {
    if (Object.entries(this.state.startMarker).length === 0) {
      this.setState({
        startMarker: data[0],
      });
    } else if (data[0].time === this.state.startMarker.time) {
      this.setState({
        startMarker: {},
      });
    } else if (Object.entries(this.state.endMarker).length === 0) {
      this.setState({
        endMarker: data[0],
      });
    } else if (data[0].time === this.state.endMarker.time) {
      this.setState({
        endMarker: {},
      });
    }
    // else {
    //   const startDiff = abs(data[0].time - this.state.startMarker.time);
    //   const endDiff = abs(data[0].time - this.state.endMarker.time);

    //   this.setState({
    //     startMarker: data[0],
    //     endMarker: newEndMarker,
    //   });
    // }
    this.props.onPointLongPress(data[0]);
  }

  shouldShowMarker(index) {
    console.log("in here");
    const selectedData = this.state.sortedData.map(series => {
      return series.data[index];
    });
    if (
      selectedData[0].time === this.state.startMarker.time ||
      selectedData[0].time === this.state.endMarker.time
    ) {
      console.log("it is true!");
      return true;
    }
    return false;
  }

  //function which currently does nothing unless we pass in a customValueRenderer prop
  drawValue(index, point) {
    let key = "pointvalue" + index;
    let size = 200;
    return (
      <View
        key={key}
        style={{
          position: "absolute",
          left: index === 0 ? point.gap : point.gap - size / 2,
          bottom: point.ratioY + 10,
          backgroundColor: "transparent",
          width: index !== 0 ? 200 : undefined,
        }}
      >
        {this.drawCustomValue(index, point)}
      </View>
    );
  }

  drawCustomValue(index, point) {
    if (this.props.customValueRenderer) {
      return this.props.customValueRenderer(index, point);
    } else {
      return null;
    }
  }

  //function which takes all data as input e.g. {gap, ratioY, time, symptom, x, y (value/comment), isEmpty}
  drawCoordinates(data, seriesColor, seriesIndex) {
    let result = [];
    let lineStyle = {
      borderColor: !seriesColor ? this.props.primaryColor : seriesColor,
    };
    let dataLength = data.length;

    for (let i = 0; i < dataLength - 1; i++) {
      result.push(
        //into results array, push return of drawCoordinate, which takes each pair of neighbouring data points and creates the LINE and onPress - this component is added to the results array
        this.drawCoordinate(
          i,
          data[i],
          data[i + 1],
          "#FFFFFF00",
          lineStyle,
          false,
          false,
          seriesIndex
        )
      );
    }
    //at this stage, result is size N-1, each element being a touchable component, the last
    //not being done yet

    //all points and values then drawn
    if (dataLength > 0) {
      //drawpoint takes an index, item and colour and creates the co-ordinate visually which changes colour on press
      result.push(this.drawPoint(0, data[0], seriesColor));
      result.push(this.drawValue(0, data[0], seriesColor));
    }

    for (let i = 0; i < dataLength - 1; i++) {
      result.push(this.drawPoint(i + 1, data[i + 1], seriesColor));
      result.push(this.drawValue(i + 1, data[i + 1], seriesColor));
    }

    //at this stage, the array is 2N-1, with N-1 dedicated to lines, and N dedicated to co-ordinates

    //this code is now concerned with the last LINE
    let lastData = Object.assign({}, data[dataLength - 1]);
    let lastCoordinate = Object.assign({}, data[dataLength - 1]);
    lastCoordinate.gap = lastCoordinate.gap + 5;
    result.push(
      this.drawCoordinate(
        dataLength,
        lastData,
        lastCoordinate,
        "#FFFFFF00",
        {},
        true,
        true,
        seriesIndex
      )
    );
    //result array is now 2N, with N-1 dedicated to lines, N to co-ordinates, and 1 to the final line
    return result;
  }

  getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
  }

  drawSelected(index) {
    if (this.state.sortedData.length === 0) return null;
    let data = this.state.sortedData[0].data;
    let dataObject = data[index];
    if (
      typeof this.state.selectedIndex === "number" &&
      this.state.selectedIndex >= 0
    ) {
      if (!dataObject) {
        return null;
      }
      let reverse = true;
      let bottom = dataObject.ratioY;

      let left = dataObject.gap;
      let gap = 0;
      if (index === data.length - 1 && index !== 0) {
        left = data[index - 1].gap;
        gap = dataObject.gap - left;
      }
      if (bottom > (this.props.height * 2) / 3) {
        reverse = false;
      }

      return (
        <View
          style={StyleSheet.flatten([
            styles.selectedWrapper,
            {
              left: left,
              justifyContent: "center",
            },
          ])}
        >
          <View
            style={StyleSheet.flatten([
              styles.selectedLine,
              {
                backgroundColor: this.props.selectedColor,
                marginLeft: gap,
              },
            ])}
          />

          <View style={styles.selectedBox}>
            {this.state.sortedData.map(series => {
              let dataObject = series.data[this.state.selectedIndex];
              return (
                <View key={series.seriesName} style={{ flex: 1 }}>
                  {dataObject.x ? (
                    <Text style={styles.tooltipTitle}>{dataObject.x}</Text>
                  ) : null}
                  {/* series colour */}
                  <View
                    style={{
                      width: 10,
                      height: 5,
                      marginRight: 3,
                      borderRadius: 2,
                      backgroundColor: !series.seriesColor
                        ? this.props.primaryColor
                        : series.seriesColor,
                    }}
                  />
                  {/* tooltip value */}
                  <Text style={styles.tooltipValue} numberOfLines={10}>
                    {numberWithCommas(dataObject.y.value, false)}{" "}
                    {dataObject.y.comment}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      );
    } else {
      return null;
    }
  }

  drawMarker(marker) {
    if (this.state.sortedData.length === 0) return null;
    if (Object.keys(marker).length === 0 && marker.constructor === Object) {
      return null;
    }
    console.log("marker", marker);

    let left = marker.gap;

    return (
      <View
        style={StyleSheet.flatten([
          styles.selectedWrapper,
          {
            left: left,
            justifyContent: "center",
          },
        ])}
      >
        <View
          style={StyleSheet.flatten([
            styles.selectedLine,
            {
              backgroundColor: "yellow",
              marginLeft: 1,
            },
          ])}
        />

        <View style={styles.selectedBox}>
          <View style={{ flex: 1 }}>
            {marker.x ? (
              <Text style={styles.tooltipTitle}>{marker.x}</Text>
            ) : null}
            {/* series colour */}
            <View
              style={{
                width: 10,
                height: 5,
                marginRight: 3,
                borderRadius: 2,
              }}
            />
            {/* tooltip value */}
            <Text style={styles.tooltipValue} numberOfLines={10}>
              MARKED
            </Text>
          </View>
        </View>
      </View>
    );
  }

  render() {
    let { fadeAnim } = this.state;
    //only show graph if sortedData contains data
    return this.state.sortedData.length > 0 ? (
      //view which encompasses entire chart, applying wrapper style and background colour
      <View
        style={StyleSheet.flatten([
          styles.wrapper,
          {
            backgroundColor: this.props.backgroundColor,
          },
        ])}
      >
        {/* view for drawing Y axis labels */}
        <View style={styles.yAxisLabelsWrapper}>
          {this.props.showYAxisLabel &&
            drawYAxisLabels(
              this.state.guideArray,
              this.props.height + 20,
              this.props.minValue,
              this.props.labelColor,
              this.props.yAxisSymbol
            )}
        </View>
        {/* main container for showing graph */}
        <View style={{ flex: 1 }}>
          {/* horizontal scrollview for looking at a range of data, containing the graph */}
          <ScrollView
            horizontal
            ref={ref => (this.scrollView = ref)}
            onContentSizeChange={() => {
              if (this.props.lineChartScrollToEnd)
                this.scrollView.scrollToEnd({ animated: false });
            }}
          >
            {/* graph container */}
            <View>
              <View ref="chartView" style={styles.chartViewWrapper}>
                {drawYAxis(this.props.yAxisColor)}
                {/* generate guide lines */}
                {drawGuideLine(
                  this.state.guideArray,
                  this.props.yAxisGridLineColor
                )}
                {/* map over each series (just one in our case) */}
                {this.state.sortedData.map((obj, index) => {
                  return (
                    <Animated.View
                      key={"animated_" + index}
                      style={{
                        transform: [{ scaleY: fadeAnim }],
                        flexDirection: "row",
                        alignItems: "flex-end",
                        height: "100%",
                        position: index === 0 ? "relative" : "absolute",
                        minWidth: 200,
                        marginBottom:
                          this.props.minValue &&
                          this.state.guideArray &&
                          this.state.guideArray.length > 0
                            ? -1 *
                              this.state.guideArray[0][2] *
                              this.props.minValue
                            : null,
                      }}
                    >
                      {/* draw the coordinates using the data (i.e. each point), series colour and index */}
                      {this.drawCoordinates(obj.data, obj.seriesColor, index)}
                    </Animated.View>
                  );
                })}
                {/* depending on the selectedIndex value, show information regarding it */}
                {this.drawSelected(this.state.selectedIndex)}
                {this.drawMarker(this.state.startMarker)}
                {this.drawMarker(this.state.endMarker)}
              </View>

              {drawXAxis(this.props.xAxisColor)}
              {this.props.showXAxisLabel &&
                drawXAxisLabels(
                  this.state.sortedData[0].data,
                  this.props.gap,
                  this.props.labelColor,
                  this.props.showEvenNumberXaxisLabel
                )}
            </View>
          </ScrollView>
        </View>
      </View>
    ) : null;
  }
}

//default props of line chart (assuming none passed in)
LineChart.defaultProps = {
  data: [],
  primaryColor: "#297AB1",
  selectedColor: "#FF0000",
  height: 100,
  gap: 60,
  yAxisSymbol: "",
  showEvenNumberXaxisLabel: true,
  initialScrollPosition: { x: 0, y: 0, animated: true },
  initialScrollTimeOut: 300,
  showYAxisLabel: true,
  showXAxisLabel: true,
  lineThickness: 1,
  onPointClick: point => {},
  onPress: () => {},
  onLongPress: () => {},
  numberOfYAxisGuideLine: 5,
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    overflow: "hidden",
  },
  yAxisLabelsWrapper: {
    paddingRight: 5,
  },
  chartViewWrapper: {
    flexDirection: "row",
  },
  coordinateWrapper: {
    overflow: "visible",
    justifyContent: "flex-start",
    alignContent: "flex-start",
  },
  lineBox: {
    justifyContent: "flex-start",
  },
  guideLine: {
    position: "absolute",
    height: "100%",
    borderRightColor: "#e0e0e050",
    borderRightWidth: 1,
  },
  absolute: {
    position: "absolute",
    width: "100%",
  },
  pointWrapper: {
    position: "absolute",
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedWrapper: {
    position: "absolute",
    height: "100%",
    width: "20%",
  },
  selectedLine: {
    position: "absolute",
    width: 1,
    height: "100%",
  },
  selectedBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    opacity: 0.8,
    borderColor: "#AAAAAA",
    borderWidth: 1,
    position: "absolute",
    padding: 3,
    marginLeft: 5,
  },
  tooltipTitle: { fontSize: 10 },
  tooltipValue: {
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default LineChart;
