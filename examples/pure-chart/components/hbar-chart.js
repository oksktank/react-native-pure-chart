import React from 'react'
import { View, Text, StyleSheet, Button, Animated, Easing } from 'react-native'

class HBarChart extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            data: [{key: 'Points', value: 25}, {key: 'Assists', value: 7}, {key: 'Rebounds', value: 18}, {key: 'Steals', value: 15}, {key: 'Blocks', value: 3}],
        }

        this.drawOneBar = this.drawOneBar.bind(this)
        this.drawHBarData = this.drawHBarData.bind(this)
        this.moveToPreDate = this.moveToPreDate.bind(this)
        this.moveToPostDate = this.moveToPostDate.bind(this)
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
          data: nextProps.data
        });
    }

    drawOneBar (key, value) {
        let widthValue = 10 * value 
        return (
            <View style={styles.element} key={key}>
                <Text>{key}</Text>
                <View style={{flexDirection: 'row'}}>
                    <View style={{width: widthValue, height: 25, backgroundColor: 'red'}} />
                    <View style={{height: 25, marginLeft: 5}}><Text style={{fontSize:8}}>{value}</Text></View>
                </View>
            </View>
        )
    }

    drawHBarData (data) {
        let result = []

        let dataLength = data.length

        for (let i=0; i<dataLength; i++) {
            result.push(this.drawOneBar(data[i].key, data[i].value))
        }

        return result
    }

    moveToPreDate () {
        alert('pre')
    }
    moveToPostDate () {
        alert('post')
    }

    render () {
        return (
            <View style={styles.container}>
                {this.drawHBarData(this.state.data)}

                <View style={{
                    justifyContent: 'center',
                    flexDirection: 'row',
                }}>
                    <View style={styles.button}><Button title="<" onPress={this.moveToPreDate} /></View>
                    <View style={styles.button}><Button title="2017-09-01" onPress={this.moveToPostDate} /></View>
                    <View style={styles.button}><Button title=">" onPress={this.moveToPostDate} /></View>
                </View>
            </View>
            
        )
    }
    

}

const styles = StyleSheet.create({
    container : {
        flexDirection: 'column',
        backgroundColor: 'white',
        margin: 10
    },
    element : {
        height: 30,
        backgroundColor: 'white',
        marginBottom: 5
    },
    button : {
        margin: 5
    }
})

HBarChart.defaultProps = {
    data: [{key:'abc', value: 9}]
}


export default HBarChart
