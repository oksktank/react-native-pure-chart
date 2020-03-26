import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import PureChart from "./pure-chart";
import moment from "moment";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.generateData = this.generateData.bind(this);
    //state which contains data for line chart (as well as data for other charts, but these are redundant in our case)
    this.state = {
      data: [],
      pieData: [
        { label: "사람", value: 110, color: "red" },
        { label: "동물", value: 140, color: "green" },
      ],
      pieData2: [
        { value: 220700.26, color: "red" },
        { value: 140700.89, color: "yellow" },
      ],
      pieData3: [{ value: 220 }, { value: 140 }],
    };
  }

  //function to generate data
  generateData() {
    //constants
    const NUMENTRIES = 3;
    const MAXVALUE = 5;
    const MAXCOMMENTLENGTH = 10;

    let data = [];
    //populate a data array with objects with random comments and values, as determined by the constants
    for (let i = 0; i < NUMENTRIES; i++) {
      let entry = {
        x: moment().format("YYYY-MM-DD"),
        y: {
          value: Math.round(Math.random() * MAXVALUE),
          comment: Math.random()
            .toString(2)
            .slice(-MAXCOMMENTLENGTH),
        },
      };
      data.push(entry);
    }
    //update the data to the current data (should do this in componentDidMount?)
    this.setState({
      data: data,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ padding: 20, marginTop: 100 }}>
          {/* pass props into PureChart */}
          <PureChart
            type={"line"}
            data={this.state.data}
            height={350}
            onPress={a => {
              console.log("onPress", a);
            }}
            onLongPress={data => {
              console.log(data);
            }}
          />
          {/* <PureChart type={"bar"} data={this.state.data} /> */}
          <Button
            style={{ marginTop: 20 }}
            title="Generate chart data"
            onPress={this.generateData}
          >
            <Text>Generate chart data</Text>
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});
