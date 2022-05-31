import React from "react"
import ReactDOM from "react-dom"
class Counter extends React.Component {
	constructor(props) {
		super(props)
		this.state = {number: 0}
		console.log('Counter 1.constructor')
	}
	UNSAFE_componentWillMount() {
		console.log('Counter 2.componentWillMount')
	}
	componentDidMount() {
		console.log('Counter 4.componentDidMount')
	}
	shouldComponentUpdate(nextProps, nextState) {
		console.log('Counter 5.shouldComponentUpdate')
		return nextState.number % 2 === 0
	}
	UNSAFE_componentWillUpdate() {
		console.log('Counter 6.componentWillUpdate')
	}
	componentDidUpdate(newProps, newState) {
		console.log('Counter 7.componentDidUpdate')
	}
	handleClick = () => {
		this.setState({number: this.state.number + 1})
	}
	render() {
		console.log('Counter 3.render')
		return (
			<div>
				<p>{this.state.number}</p>
				{this.state.number === 4 ? null : <ChildCount count={this.state.number}/>}
				<button onClick={this.handleClick}>+</button>
			</div>
		)
	}
}
class ChildCount extends React.Component {
	UNSAFE_componentWillMount() {
		console.log('ChildCount 1.componentWillMount')
	}
	componentDidMount() {
		console.log('ChildCount 3.componentDidMount')
	}
	UNSAFE_componentWillReceiveProps(newProps) {
		console.log('ChildCount 4.componentWillReceiveProps')
	}
	shouldComponentUpdate(nextProps, nextState) {
		console.log('ChildCount 5.shouldComponentUpdate')
		return nextProps.count % 3 === 0
	}
	componentWillUnmount() {
		console.log('ChildCount 6.componentWillUnmount')
	}
	render() {
		console.log('ChildCount 2.render')
		return (
			<p>{this.props.count}</p>
		)
	}
}
ReactDOM.render(<Counter />, document.getElementById("root"))

/**
  组件的生命周期
  Counter 1.constructor
  Counter 2.componentWillMount
  Counter 3.render
  Counter 4.componentDidMount
  Counter 5.shouldComponentUpdate
  Counter 6.componentWillUpdate
  Counter 3.render
  Counter 7.componentDidUpdate
 */

 /**
	 父子组件混合生命周期
	 Counter 1.constructor
   Counter 2.componentWillMount
   Counter 3.render
   ChildCount 1.componentWillMount
   ChildCount 2.render
   ChildCount 3.componentDidMount
   Counter 4.componentDidMount
   Counter 5.shouldComponentUpdate
   Counter 6.componentWillUpdate
   Counter 3.render
   ChildCount 4.componentWillReceiveProps
   ChildCount 5.shouldComponentUpdate
   Counter 7.componentDidUpdate
   Counter 5.shouldComponentUpdate
   Counter 6.componentWillUpdate
   Counter 3.render
   ChildCount 6.componentWillUnmount
   Counter 7.componentDidUpdate
   Counter 5.shouldComponentUpdate
   Counter 6.componentWillUpdate
   Counter 3.render
   ChildCount 1.componentWillMount
   ChildCount 2.render
   ChildCount 3.componentDidMount
   Counter 7.componentDidUpdate
  */