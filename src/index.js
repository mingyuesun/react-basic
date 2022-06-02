import React from "react"
import ReactDOM from "react-dom"
class Counter extends React.Component {
	constructor(props) {
		super(props)
		this.state = {number: 0}
	}
	handleClick = () => {
		this.setState({number: this.state.number + 1})
	}
	render() {
		return (
			<div>
				<p>{this.state.number}</p>
				<ChildCount count={this.state.number}/>
				<button onClick={this.handleClick}>+</button>
			</div>
		)
	}
}
class ChildCount extends React.Component {
	constructor(props) {
		super(props)
		this.state = {number : 0}
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		const {count} = nextProps
		if (count % 2 === 0) {
			return {number: count * 2}
		} else {
			return {number: count * 3}
		}
	}
	render() {
		return (
			<p>{this.state.number}</p>
		)
	}
}
ReactDOM.render(<Counter />, document.getElementById("root"))