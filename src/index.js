import React from "./react"
import ReactDOM from "./react-dom"

class ClassCounter extends React.PureComponent {
  render() {
    console.log('ClassCounter render')
    return (
      <div>ClassCounter: {this.props.count}</div>
    )
  }
}

function FunctionCounter(props) {
  console.log('FunctionCounter render')
  return <div>FunctionCounter: {props.count}</div>
}
const MemoFunctionCounter = React.memo(FunctionCounter)
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {number: 0}
    this.amountRef = React.createRef()
  }
  handleClick = () => {
    let nextNumber = this.state.number + parseInt(this.amountRef.current.value)
    this.setState({number: nextNumber})
  }
  render(){
    return (
      <div>
        <ClassCounter count={this.state.number}/>
        <MemoFunctionCounter count={this.state.number}/>
        <input ref={this.amountRef} defaultValue={1}/>
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}
ReactDOM.render(<App/>, document.getElementById("root"))
