# [React Native Pure Chart](https://github.com/oksktank/react-native-pure-chart)



description



## [Demo]
![alt text](https://raw.githubusercontent.com/oksktank/react-native-pure-chart/master/examples/sample.gif)

## Installation



```bash
yarn add react-native-pure-chart
```

Alternatively with npm:
```bash
npm install react-native-pure-chart --save
```


## Usage

#### Simple

```js
import PureChart from 'react-native-pure-chart';

render(
  ...
  <PureChart data={[30,200,170,250,10]} type='line' />
  ...
);
```


### Props

##### `type`: string
type of chart. ['line'] is now available

##### `data`: array
data for chart 
```js 
  var data = [30, 200, 170, 250, 10] 
  var dataWithLabel = [{x: '2017-10-01', y: 30}, {x: '2017-10-02', y: 200}, {x: '2017-10-03', y:170} ... ]
```

## License
MIT
