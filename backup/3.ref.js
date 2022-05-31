import React from "./react"
import ReactDOM from "./react-dom"
let lastCounter
class Counter extends React.Component {
	render(){
		return <div>Counter</div>
	}
}

function Func(props, forwardRef) {
	return <div ref={forwardRef}>Func</div>
}

const ForwardFunc = React.forwardRef(Func)
console.log(ForwardFunc)
class Sum extends React.Component {
	constructor(props) {
		super(props)
		this.a = React.createRef()
		this.b = React.createRef()
		this.result = React.createRef()	
		this.counter = React.createRef()
		this.func = React.createRef()	
		this.state = {number: 1}
	}
	handleClick = () => {
		let valueA = this.a.current.value
		let valueB = this.b.current.value
		this.result.current.value = valueA + valueB
		// console.log(this.counter.current)
	}
	onClick = () => {
		console.log(this.func.current)
		lastCounter = this.counter.current
		this.setState(state => ({number: state.number + 1}), () => {
			console.log(this.counter.current === lastCounter)
		})
	}
	render() {
		return (
			<div>
			{/* <Func ref={this.func}/> */}
			<ForwardFunc ref={this.func}/>
			<Counter ref={this.counter}/>
			<button onClick={this.onClick}>{this.state.number}</button>
			<input ref={this.a}/>+<input ref={this.b}/><button onClick={this.handleClick}>=</button><input ref={this.result}/>
		</div>
		)
	}
}

ReactDOM.render(<Sum title={"计时器"} />, document.getElementById("root"))
