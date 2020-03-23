'use strict';
import React, {Component} from 'react';
import ReactNative, {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Dimensions,
    Platform,
    ViewPropTypes,
    Animated
} from 'react-native';
import PropTypes from 'prop-types';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
export default class ScrollPicker extends Component {
    static propTypes = {
        style:ViewPropTypes.style,
        dataSource:PropTypes.array.isRequired,
        selectedIndex:PropTypes.number,
        onValueChange:PropTypes.func,
        renderItem:PropTypes.func,
        highlightColor:PropTypes.string,
        itemHeight:PropTypes.number,
        wrapperHeight:PropTypes.number,
        wrapperColor:PropTypes.string,
    };
    constructor(props){
        super(props);
        this.itemHeight = this.props.itemHeight || 30;
        this.wrapperHeight = this.props.wrapperHeight || (this.props.style ? this.props.style.height : 0) ||this.itemHeight * 5;
        this.state = {
            selectedIndex: this.props.selectedIndex || 0,
            scrollValue: new Animated.Value(0)
        };
    }
    componentDidMount(){
        if(this.props.selectedIndex){
            setTimeout(() => {
                this.scrollToIndex(this.props.selectedIndex);
            }, 0);
        }
    }
    componentWillUnmount(){
        this.timer && clearTimeout(this.timer);
    }
    render(){
        const { combined, width, pickerIndex } = this.props
        let {header, footer} = this._renderPlaceHolder();
        let highlightWidth = (this.props.style ? this.props.style.width : 0) || deviceWidth;
        let highlightColor = this.props.highlightColor || '#333';
        let wrapperStyle = combined ? {
            height:this.wrapperHeight,
            flex: 1,
            overflow:'hidden',
            paddingRight: pickerIndex === 0 ? 10 : 0 
        } : {
            height:this.wrapperHeight,
            flex: 1,
            overflow:'hidden',
            paddingRight: pickerIndex === 0 ? 10 : 0 
        };
        let highlightStyle = {
            position:'absolute',
            top:(this.wrapperHeight - this.itemHeight) / 2,
            height:this.itemHeight,
            width:highlightWidth,
            borderTopColor:highlightColor,
            borderBottomColor:highlightColor,
            borderTopWidth:StyleSheet.hairlineWidth,
            borderBottomWidth:StyleSheet.hairlineWidth,
        };
        return (
            <View style={wrapperStyle}>
                <View style={highlightStyle}></View>
                <Animated.ScrollView
                    // decelerationRate={0.5}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: this.state.scrollValue } } }], {useNativeDriver: true}
                      )}
                    scrollEventThrottle={16}
                    ref={(sview) => { this.sview = sview; }}
                    bounces={false}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    onMomentumScrollBegin={this._onMomentumScrollBegin.bind(this)}
                    onMomentumScrollEnd={this._onMomentumScrollEnd.bind(this)}
                    onScrollBeginDrag={this._onScrollBeginDrag.bind(this)}
                    onScrollEndDrag={this._onScrollEndDrag.bind(this)}
                >
                    {header}
                    {this.props.dataSource.map(this._renderItem.bind(this))}
                    {footer}
                </Animated.ScrollView>
            </View>
        )
    }
    _renderPlaceHolder(){
        let h = (this.wrapperHeight - this.itemHeight) / 2;
        let header = <View style={{height:h, flex:1,}}></View>;
        let footer = <View style={{height:h, flex:1,}}></View>;
        return {header, footer};
    }
    _renderItem(data, index){
        let isSelected = index === this.state.selectedIndex;
        const distanceFromViewCenter = Math.abs(index * this.itemHeight);
        const inputRange = [
            // distanceFromViewCenter - 5 * this.itemHeight,
            // distanceFromViewCenter - 4 * this.itemHeight,
            distanceFromViewCenter - 3 * this.itemHeight,
          distanceFromViewCenter - 2 * this.itemHeight,
          distanceFromViewCenter - this.itemHeight,
          distanceFromViewCenter, // Middle of picker            
          distanceFromViewCenter + this.itemHeight,
          distanceFromViewCenter + 2 * this.itemHeight ,
          distanceFromViewCenter + 3 * this.itemHeight,
        //   distanceFromViewCenter + 4 * this.itemHeight,
        //   distanceFromViewCenter + 5 * this.itemHeight
        ];
        // const fontSize = this.state.scrollValue.interpolate({
        //     inputRange: inputRange,
        //     outputRange: [  14 ,16, 18, 22, 18, 16, 14  ],
        //     extrapolate: 'clamp',
        // })
        const rotateX = this.state.scrollValue.interpolate({
            inputRange: inputRange,
            outputRange: [ '50deg', '25deg', '15deg', '0deg', '15deg', '25deg', '50deg', ],
            extrapolate: 'clamp',
        })
        // const color = this.state.scrollValue.interpolate({
        //     inputRange: inputRange,
        //     outputRange: [ '#757575', '#757575', '#757575', '#000', '#757575', '#757575', '#757575', ],
        //     extrapolate: 'clamp',
        // })
        const opacity = this.state.scrollValue.interpolate({
            inputRange: inputRange,
            outputRange: [ 0.3, 0.5, 0.7, 1, 0.7, 0.5, 0.3 ],
            extrapolate: 'clamp',
        })
        const scale = this.state.scrollValue.interpolate({
            inputRange: inputRange,
            outputRange: [ 0.4, 0.6, 0.8, 1, 0.8, 0.6, 0.4 ],
            extrapolate: 'clamp',
        })
        const dataName = data.name
        let item = <Animated.Text 
                        style={ 
                                    [ 
                                        styles.itemText, 
                                        {   
                                            opacity: opacity,
                                            fontSize: 20, 
                                            transform: [{ rotateX: rotateX}, {scale: scale}], 
                                            color: 'black' 
                                        }
                                    ]
                                }
                    >
                        {dataName}
                    </Animated.Text>;
        if(this.props.renderItem){
            item = this.props.renderItem(data, index, isSelected);
        }
        return (
            <View style={[styles.itemWrapper, {height:this.itemHeight}]} key={index}>
                {item}
            </View>
        );
    }
    _scrollFix(e){
        let y = 0;
        let h = this.itemHeight;
        if(e.nativeEvent.contentOffset){
            y = e.nativeEvent.contentOffset.y;
        }
        let selectedIndex = Math.round(y / h);
        let _y = selectedIndex * h;
        if(_y !== y){
            // using scrollTo in ios, onMomentumScrollEnd will be invoked 
            if(Platform.OS === 'ios'){
                this.isScrollTo = true;
            }
            this.sview.getNode().scrollTo({y:_y});
        }
        if(this.state.selectedIndex === selectedIndex){
            return;
        }
        // onValueChange
        if(this.props.onValueChange){
            let selectedValue = this.props.dataSource[selectedIndex];
            this.setState({
                selectedIndex:selectedIndex,
            }, () => {
                this.props.onValueChange(selectedValue, selectedIndex);
            });
        }
    }
    _onScrollBeginDrag(){
        this.dragStarted = true;
        if(Platform.OS === 'ios'){
            this.isScrollTo = false;
        }
        this.timer && clearTimeout(this.timer);
    }
    _onScrollEndDrag(e){
        this.dragStarted = false;
        // if not used, event will be garbaged
        let _e = {
            nativeEvent:{
                contentOffset:{
                    y: e.nativeEvent.contentOffset.y,
                },
            },
        };
        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(
            () => {
                if(!this.momentumStarted && !this.dragStarted){
                    this._scrollFix(_e, 'timeout');
                }
            },
            10
        );
    }
    _onMomentumScrollBegin(e){
        this.momentumStarted = true;
        this.timer && clearTimeout(this.timer);
    }
    _onMomentumScrollEnd(e){
        this.momentumStarted = false;
        if(!this.isScrollTo && !this.momentumStarted && !this.dragStarted){
            this._scrollFix(e);
        }
    }
    scrollToIndex(ind){
        this.setState({
            selectedIndex:ind,
        });
        let y = this.itemHeight * ind;
        this.sview && this.sview.getNode().scrollTo({y:y});
    }
    getSelected(){
        let selectedIndex = this.state.selectedIndex;
        let selectedValue = this.props.dataSource[selectedIndex];
        return selectedValue;
    }
}
let styles = StyleSheet.create({
    itemWrapper: {
        height:30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText:{
        color:'#999',
    }
});
