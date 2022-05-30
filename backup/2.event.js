import React from "./react"
import ReactDOM from "./react-dom"

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { number: 0 }
  }
  handleClick = (event) => {
    this.setState(state => ({number: state.number + 1}))
		console.log(this.state.number)
		this.setState(state => ({number: state.number + 1}))
		console.log(this.state.number)
		// setTimeout(() => {
		// 	this.setState({number: this.state.number + 1})
		// 	console.log(this.state.number)
		// 	this.setState({number: this.state.number + 1})
		// 	console.log(this.state.number)
		// })
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

ReactDOM.render(<Counter title={"计时器"} />, document.getElementById("root"))
