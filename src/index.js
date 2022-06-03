import React from "react"
import ReactDOM from "react-dom"

class MouseTracker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {x: 0, y: 0}
  }
  mouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    })
  }
  render() {
    return (
      <div onMouseMove={this.mouseMove}>
        <h1>鼠标位置</h1>
        <p>当前鼠标的位置是{this.state.x}, {this.state.y}</p>
      </div>
    )
  }
}

ReactDOM.render(<MouseTracker />, document.getElementById("root"))
