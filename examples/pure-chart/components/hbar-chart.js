import React from 'react'
import { View, Text, StyleSheet, Button, Animated, Easing } from 'react-native'

class HBarChart extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            data: [
                {date:'20180602', 
                datas:[
                    {key: 'Points', value: 25}, {key: 'Assists', value: 7}, {key: 'Rebounds', value: 18}, {key: 'Steals', value: 15}, {key: 'Blocks', value: 3}
                ]}
            ],
            index: 0
        }

        this.drawOneBar = this.drawOneBar.bind(this)
        this.drawHBarData = this.drawHBarData.bind(this)
        this.moveToPreDate = this.moveToPreDate.bind(this)
        this.moveToPostDate = this.moveToPostDate.bind(this)
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
          data: nextProps.data,
          index: 0
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

    drawHBarData (datas, index) {
        let result = []

        if(datas.length > 0){
            let data = datas[index].datas
            let dataLength = data.length

            for (let i=0; i<dataLength; i++) {
                result.push(this.drawOneBar(data[i].key, data[i].value))
            }
        }

        return result
    }

    moveToPreDate () {
        var preIndex = this.state.index
       
        if(preIndex > 0){
            var nextDate = this.state.data[preIndex-1].date;
            this.setState({
                index: preIndex-1
            })
        }
            
    }
    moveToPostDate () {
        var preIndex = this.state.index
        var dataLength = this.state.data.length
        
        if(preIndex < dataLength-1){
            var nextDate = this.state.data[preIndex+1].date;
            this.setState({
                index: preIndex + 1
            })
        }
            
    }

    render () {
        return (
            <View style={styles.container}>
                {this.drawHBarData(this.state.data, this.state.index)}

                <View style={{
                    justifyContent: 'center',
                    flexDirection: 'row',
                }}>
                    <View style={styles.button}><Button title="<" onPress={this.moveToPreDate} /></View>
                    <View style={styles.button}><Button title={this.state.data[this.state.index].date} onPress={this.moveToPostDate} /></View>
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
    
}


export default HBarChart
