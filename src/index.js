import React from "./react"
import ReactDOM from "./react-dom"
import { updateQueue } from "./Component"

class Counter extends React.Component {
	constructor(props) {
		super(props)
		this.state = { number: 0 }
	}
  handleClick = () => {
		updateQueue.isBatchingUpdate = true
		this.setState({ number: 2 })
		this.setState({ number: 2 })
		this.setState({ number: 3 })
		updateQueue.batchUpdate()
	}
	render() {
		return (
			<div>
				<p>{this.props.title}</p>
				<p>{this.state.number}</p>
				<button onClick={this.handleClick}>+</button>
			</div>
		)
	}
}

ReactDOM.render(<Counter title={"计时器"}/>, document.getElementById('root'))