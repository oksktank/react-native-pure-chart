import React from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  GestureResponderEvent
} from "react-native";

type ColumnChartItemProps = {
  seriesArray: Array<{
    data: any;
    seriesColor: string;
  }>;
  defaultHeight: number;
  highlightColor: string;
  defaultMargin: number;
  defaultWidth: number;
  dataIndex: number;
  isSelected: boolean;
  onClick?: (event: GestureResponderEvent) => void;
};

export default class ColumnChartItem extends React.Component<
  ColumnChartItemProps,
  {}
> {
  render() {
    let renders = [];
    let seriesCount = this.props.seriesArray.length;
    for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
      let lastElementMarginRight = 0;
      if (seriesIndex === seriesCount - 1) {
        lastElementMarginRight = this.props.defaultMargin;
      }
      renders.push(
        <View
          key={seriesIndex}
          style={[
            styles.bar,
            {
              width: this.props.defaultWidth / seriesCount,
              height: this.props.seriesArray[seriesIndex].data[
                this.props.dataIndex
              ]["ratioY"],
              marginRight: lastElementMarginRight,
              backgroundColor: this.props.seriesArray[seriesIndex].seriesColor,
              borderColor: this.props.isSelected
                ? this.props.highlightColor
                : "#FFFFFF"
            }
          ]}
        />
      );
    }
    return (
      <TouchableWithoutFeedback onPressIn={evt => this.props.onClick(evt)}>
        <View style={{ height: this.props.defaultHeight }}>
          <View style={styles.chartView}>{renders}</View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  chartView: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
    paddingTop: 20
  },
  bar: {
    justifyContent: "flex-end",
    borderWidth: 1
  }
});
