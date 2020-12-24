'use strict'
import React, { Component } from 'react'
import ReactNative, {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Platform,
  ViewPropTypes,
  Animated
} from 'react-native'
import _ from 'lodash'
import PropTypes from 'prop-types'
const deviceWidth = Dimensions.get('window').width
const deviceHeight = Dimensions.get('window').height
export default class ScrollPicker extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    dataSource: PropTypes.array.isRequired,
    selectedIndex: PropTypes.number,
    onValueChange: PropTypes.func,
    renderItem: PropTypes.func,
    highlightColor: PropTypes.string,
    itemHeight: PropTypes.number,
    wrapperHeight: PropTypes.number,
    wrapperColor: PropTypes.string
  }
  constructor(props) {
    super(props)
    this.itemHeight = this.props.itemHeight || 30
    this.wrapperHeight =
      this.props.wrapperHeight ||
      (this.props.style ? this.props.style.height : 0) ||
      this.itemHeight * 5
    this.state = {
      selectedIndex: this.props.selectedIndex || 0,
      scrollValue: new Animated.Value(0)
    }
  }
  componentDidMount() {
    if (this.props.selectedIndex) {
      setTimeout(() => {
        this.scrollToIndex(this.props.selectedIndex)
      }, 0)
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (
      !_.isEqual(nextProps.dataSource, this.props.dataSource) ||
      !_.isEqual(nextProps.selectedIndex, this.props.selectedIndex)
    ){
      return true
    }
    return false
  }
  componentDidUpdate(prevProps) {
    if (this.props.selectedIndex !== prevProps.selectedIndex)
      setTimeout(() => {
        this.scrollToIndex(this.props.selectedIndex)
      }, 0)
  }
  componentWillUnmount() {
    this.timer && clearTimeout(this.timer)
  }
  getItemLayout = (data, index) => (
    { length: this.itemHeight, offset: this.itemHeight * index, index }
  )
  render() {
    const { combined, width, pickerIndex, flatlist = false } = this.props
    let { header, footer } = this._renderPlaceHolder()
    let highlightWidth =
      (this.props.style ? this.props.style.width : 0) || deviceWidth
    let highlightColor = this.props.highlightColor || '#333'
    let wrapperStyle = combined
      ? {
          height: this.wrapperHeight,
          flex: 1,
          overflow: 'hidden',
          paddingRight: pickerIndex === 0 ? 10 : 0
        }
      : {
          height: this.wrapperHeight,
          flex: 1,
          overflow: 'hidden',
          paddingRight: pickerIndex === 0 ? 10 : 0
        }
    let highlightStyle = {
      position: 'absolute',
      top: (this.wrapperHeight - this.itemHeight) / 2,
      height: this.itemHeight,
      width: highlightWidth,
      borderTopColor: highlightColor,
      borderBottomColor: highlightColor,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth
    }
    if (flatlist) {
      return (
        <View style={wrapperStyle}>
          <View style={highlightStyle}></View>
          <Animated.FlatList
            // decelerationRate={0.5}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: { contentOffset: { y: this.state.scrollValue } }
                }
              ],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            ref={fview => {
              this.fview = fview
            }}
            initialNumToRender={10}
            bounces={false}
            nestedScrollEnabled={true}
            useNativeDriver={true}
            showsVerticalScrollIndicator={false}
            onMomentumScrollBegin={this._onMomentumScrollBegin.bind(this)}
            onMomentumScrollEnd={this._onMomentumScrollEnd.bind(this)}
            onScrollBeginDrag={this._onScrollBeginDrag.bind(this)}
            onScrollEndDrag={this._onScrollEndDrag.bind(this)}
            data={this.props.dataSource}
            contentContainerStyle={{
                paddingTop: (this.wrapperHeight - this.itemHeight) / 2,
                paddingBottom: (this.wrapperHeight - this.itemHeight) / 2,
              }}
            renderItem={({ item, index }) => {
              return (
                this._renderItem(item, index)
              ) 
            }}
            getItemLayout={this.getItemLayout}
            onEndReached={({distanceFromEnd})=>{
              if(this.props.addDownData){
                this.props.addDownData(distanceFromEnd)
              }
            }}
            onEndReachedThreshold={10}
          />
        </View>
      )
    } else {
      return (
        <View style={wrapperStyle}>
          <View style={highlightStyle}></View>
          <Animated.ScrollView
            // decelerationRate={0.5}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: { contentOffset: { y: this.state.scrollValue } }
                }
              ],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            ref={sview => {
              this.sview = sview
            }}
            bounces={false}
            nestedScrollEnabled={true}
            useNativeDriver={true}
            showsVerticalScrollIndicator={false}
            onMomentumScrollBegin={this._onMomentumScrollBegin.bind(this)}
            onMomentumScrollEnd={this._onMomentumScrollEnd.bind(this)}
            onScrollBeginDrag={this._onScrollBeginDrag.bind(this)}
            onScrollEndDrag={this._onScrollEndDrag.bind(this)}
          >
            {header}
            {this.props.dataSource.map((item, index)=> this._renderItem(item,index))}
            {footer}
          </Animated.ScrollView>
        </View>
      )
    }
  }
  _renderPlaceHolder() {
    let h = (this.wrapperHeight - this.itemHeight) / 2
    let header = <View style={{ height: h, flex: 1 }}></View>
    let footer = <View style={{ height: h, flex: 1 }}></View>
    return { header, footer }
  }
  _renderItem = (data, index) => {
    let isSelected = index === this.state.selectedIndex
    const distanceFromViewCenter = Math.abs(index * this.itemHeight)
    const inputRange = [
      distanceFromViewCenter - this.itemHeight,
      distanceFromViewCenter, // Middle of picker
      distanceFromViewCenter + this.itemHeight
    ]
    const rotateX = this.state.scrollValue.interpolate({
      inputRange: inputRange,
      outputRange: ['25deg', '0deg', '25deg'],
      extrapolate: 'clamp'
    })
    const opacity = this.state.scrollValue.interpolate({
      inputRange: inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp'
    })
    const scale = this.state.scrollValue.interpolate({
      inputRange: inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp'
    })
    const dataName = data.name
    let item = (
      <Animated.Text
        style={[
          styles.itemText,
          {
            opacity: opacity,
            fontSize: 20,
            transform: [{ rotateX: rotateX }, { scale: scale }],
            color: '#2E3D5C'
          }
        ]}
      >
        {dataName}
      </Animated.Text>
    )
    if (this.props.renderItem) {
      item = this.props.renderItem(data, index, isSelected)
    }
    return (
      <View
        style={[styles.itemWrapper, { height: this.itemHeight }]}
        key={index}
      >
        {item}
      </View>
    )
  }
  _scrollFix(e) {
    let y = 0
    let h = this.itemHeight
    if (e.nativeEvent.contentOffset) {
      y = e.nativeEvent.contentOffset.y
    }
    let selectedIndex = Math.round(y / h)
    let _y = selectedIndex * h
    if (_y !== y) {
      // using scrollTo in ios, onMomentumScrollEnd will be invoked
      if (Platform.OS === 'ios') {
        this.isScrollTo = true
      }
      this.sview?.getNode().scrollTo({ y: _y })
      this.fview?.getNode().scrollToOffset({
        offset: _y,
        animated: true
     })
    }
    if (this.state.selectedIndex === selectedIndex) {
      return
    }
    // onValueChange
    if (this.props.onValueChange) {
      let selectedValue = this.props.dataSource[selectedIndex]
      this.setState(
        {
          selectedIndex: selectedIndex
        },
        () => {
          this.props.onValueChange(selectedValue, selectedIndex)
        }
      )
    }
  }
  _onScrollBeginDrag() {
    this.dragStarted = true
    if (Platform.OS === 'ios') {
      this.isScrollTo = false
    }
    this.timer && clearTimeout(this.timer)
  }
  _onScrollEndDrag(e) {
    this.dragStarted = false
    // if not used, event will be garbaged
    let _e = {
      nativeEvent: {
        contentOffset: {
          y: e.nativeEvent.contentOffset.y
        }
      }
    }
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      if (!this.momentumStarted && !this.dragStarted) {
        this._scrollFix(_e, 'timeout')
      }
    }, 10)
  }
  _onMomentumScrollBegin(e) {
    this.momentumStarted = true
    this.timer && clearTimeout(this.timer)
  }
  _onMomentumScrollEnd(e) {
    this.momentumStarted = false
    if (!this.isScrollTo && !this.momentumStarted && !this.dragStarted) {
      this._scrollFix(e)
    }
  }
  scrollToIndex(ind) {
    this.setState({
      selectedIndex: ind
    })
    let y = this.itemHeight * ind
    this.sview && this.sview?.getNode().scrollTo({ y: y })
    // this.fview && this.fview?.getNode().scrollToOffset({
    //   offset: y,
    //   animated: true
    // })
    this.fview && this.fview?.getNode().scrollToIndex({
      index: ind,
      animated: false
    })
  }
  getSelected() {
    let selectedIndex = this.state.selectedIndex
    let selectedValue = this.props.dataSource[selectedIndex]
    return selectedValue
  }
}
let styles = StyleSheet.create({
  itemWrapper: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemText: {
    color: '#999'
  }
})
