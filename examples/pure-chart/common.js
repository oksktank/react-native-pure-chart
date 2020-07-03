import _ from 'lodash'
import React from 'react'
import {View, Text} from 'react-native'

const SINGLE_SERIES_WITH_NUMBERS = 0
const SINGLE_SERIES_WITH_OBJECTS = 1
const MULTI_SERIES = 2

function flattenData (data) {
  let numberCount = 0
  let objectWithYCount = 0
  let multiSeriesCount = 0
  let length = data.length
  data.map((obj) => {
    if (typeof obj === 'number') {
      numberCount++
    } else if (typeof obj === 'object') {
      if (typeof obj.y === 'number') {
        objectWithYCount++
      } else if (Array.isArray(obj.data)) {
        multiSeriesCount++
      }
    }
  })

  if (numberCount === length || objectWithYCount === length) {
    return [{
      seriesName: '',
      data: data
    }]
  } else if (multiSeriesCount === length) {
    return data
  } else {
    return [{
      seriesName: '',
      data: []
    }]
  }
}

function getMaxValue (data) {
  let values = []

  data.map((value) => {
    if (typeof value === 'number') {
      values.push(value)
    } else if (typeof value === 'object') {
      if (typeof value.y === 'number') {
        values.push(value.y)
      } else if (Array.isArray(value.data)) {
        value.data.map((v) => {
          if (typeof v === 'number') {
            values.push(v)
          } else if (typeof v === 'object' && typeof v.y === 'number') {
            values.push(v.y)
          }
        })
      }
    }
  })

  if (values.length === 0) return 0

  return Math.max.apply(null, values)
}

export const initData = (dataProp, height, gap, numberOfPoints = 5) => {
  let guideArray, max, sortedData
  if (!dataProp || !Array.isArray(dataProp) || dataProp.length === 0) {
    return {
      sortedData: [],
      max: 0,
      guideArray: []
    }
  }

  max = Math.max(getMaxValue(dataProp))
  guideArray = getGuideArray(max, height, numberOfPoints)

  dataProp = flattenData(dataProp)

  sortedData = refineData(dataProp, max, height, gap)
  return {
    sortedData: sortedData,
    max: max,
    selectedIndex: null,
    nowHeight: 200,
    nowWidth: 200,
    scrollPosition: 0,
    nowX: 0,
    nowY: 0,
    guideArray: guideArray
  }
}

export const refineData = (flattenData, max, height, gap) => {
  let result = []

  flattenData.map((series) => {
    let dataProp = series.data
    let object = {
      seriesName: series.seriesName,
      seriesColor: series.color
    }
    let data = []
    let length = dataProp.length
    let simpleTypeCount = 0
    let objectTypeCount = 0

    for (let i = 0; i < length; i++) {
      let maxClone = max

      if (maxClone === 0) {
        maxClone = 1
      }
      let dataObject = {}

      if (typeof dataProp[i] === 'number') {
        simpleTypeCount++
        dataObject.ratioY = dataProp[i] / maxClone * height
        dataObject.y = dataProp[i]
        dataObject = {
          gap: i * gap,
          ratioY: dataProp[i] / maxClone * height,
          y: dataProp[i]
        }
      } else if (typeof dataProp[i] === 'object') {
        let isEmpty = false
        if (dataProp[i].y === null) {
          let nullCount = 0
          for (let j = i; j < dataProp.length; j++) {
            if (dataProp[j].y) {
              break
            } else {
              nullCount++
            }
          }
          dataProp[i].y = dataProp[i - 1].y + (dataProp[i + nullCount].y - dataProp[i - 1].y) / (nullCount + 1)
          isEmpty = true
          /* if (dataProp[i + 1] && dataProp[i - 1]) {
            dataProp[i].y = (dataProp[i - 1].y + dataProp[i + 1].y) / 2
            isEmpty = true
          } */
        }
        if (typeof dataProp[i].y === 'number' && dataProp[i].x) {
          objectTypeCount++
          dataObject = {
            gap: i * gap,
            ratioY: dataProp[i].y / maxClone * height,
            x: dataProp[i].x,
            y: dataProp[i].y,
            isEmpty: isEmpty
          }
        }
      }
      data.push(dataObject)
    }

    // validation
    let isValidate = false
    if (simpleTypeCount === length || objectTypeCount === length) {
      isValidate = true
    }

    if (isValidate) {
      object.data = data.sort((a, b) => {
        return a['gap'] - b['gap']
        // return a[0] - b[0]
      })
    } else {
      object.data = []
    }

    result.push(object)
  })

  return result
}

export const getGuideArray = (max, height, numberOfPoints = 5) => {
  let x = parseInt(max)

  let arr = []
  let length
  let temp
  let postfix = ''

  if (x === 0) {
    return []
  }

  if (x > -1 && x < 1000) {
    x = Math.round(x * 10)
    temp = 1
  } else if (x >= 1000 && x < 1000000) {
    postfix = 'K'
    x = Math.round(x / 100)
    temp = 1000
  } else if (x >= 1000000 && x < 1000000000) {
    postfix = 'M'
    x = Math.round(x / 100000)
    temp = 1000000
  } else {
    postfix = 'B'
    x = Math.round(x / 100000000)
    temp = 1000000000
  }
  length = x.toString().length

  x = _.round(x, -1 * length + 1) / 10
  let first = parseInt(x.toString()[0])

  if (first > -1 && first < 3) { // 1,2
    x = 2.5 * x / first
  } else if (first > 2 && first < 6) { // 4,5
    x = 5 * x / first
  } else {
    x = 10 * x / first
  }

  for (let i = 1; i < numberOfPoints + 1; i++) {
    let v = (x / numberOfPoints * (i/2.5 ))
    arr.push([v + postfix, v * temp / max * height, 1 * temp / max * height])
  }
  return arr
}

export const drawYAxis = (color = '#e0e0e0') => {
  return (
    <View style={{
      borderRightWidth: 1,
      borderColor: color,
      width: 1,
      height: '100%',
      marginRight: 0

    }} />

  )
}

export const drawYAxisLabels = (arr, height, minValue, color = '#000000', symbol='') => {
  return (
    <View style={{
      width: 33 + 5*symbol.length,
      height: height,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      marginBottom: minValue && arr && arr.length > 0 ? -1 * arr[0][2] * minValue : null,
      overflow: 'hidden'
    }}>

      {arr.length === 0 ? (
        <View
          key={'guide0'}
          style={{
            bottom: 0,
            position: 'absolute'
          }}>
          <Text style={{fontSize: 11}}>0</Text>
        </View>
      ) : arr.map((v, i) => {
        if (v[1] > height-5) return null
        return (
          <View
            key={'guide' + i}
            style={{
              bottom: v[1] - 5,
              position: 'absolute'
            }}>
            <Text style={{fontSize: 11, color: color}}>{v[0] + ' ' + symbol}</Text>
          </View>
        )
      })}

    </View>
  )
}
export const drawGuideLine = (arr, color = '#e0e0e0') => {
  return (
    <View style={{
      width: '100%',
      height: '100%',
      position: 'absolute'
    }}>

      {arr.map((v, i) => {
        return (
          <View
            key={'guide' + i}
            style={{
              width: '100%',
              borderTopWidth: 1,
              borderTopColor: color,
              bottom: v[1],
              position: 'absolute'
            }} />
        )
      })}

    </View>
  )
}

export const numberWithCommas = (x, summary = true) => {
  let postfix = ''
  if (summary) {
    if (x >= 1000 && x < 1000000) {
      postfix = 'K'
      x = Math.round(x / 100) / 10
    } else if (x >= 1000000 && x < 1000000000) {
      postfix = 'M'
      x = Math.round(x / 100000) / 10
    } else if (x >= 1000000000 && x < 1000000000000) {
      postfix = 'B'
      x = Math.round(x / 100000000) / 10
    }
  }

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + postfix
}

export const drawXAxis = (color = '#e0e0e0') => {
  return (
    <View style={{
      width: '100%',
      borderTopWidth: 1,
      borderTopColor: color
    }} />
  )
}
export const drawXAxisLabels = (sortedData, gap, color = '#000000', showEvenNumberXaxisLabel, defautColumnWidth) => {
  return (
    <View style={{
      width: '100%',
      paddingVertical: 10,
      height: 10,
    }}>
      {sortedData.map((data, i) => {
        let marginLeft = i === 0 ? sortedData[1]['gap'] : sortedData[1]['gap']*(i+1) + defautColumnWidth*((i)*2)
        if (data['x']  || !showEvenNumberXaxisLabel) {
          return (
            <View key={'label' + i} style={{
              position: 'absolute',
              left: marginLeft,
              top: 5,
            }}>
              <Text style={{fontSize: 9, color: color}}>
                {
                  // data[3]
                  data['x']
                }
              </Text>
            </View>
          )
        } else {
          return null
        }
      })}
    </View>
  )
}
