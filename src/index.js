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
        {this.props.render(this.state)}
      </div>
    )
  }
}

ReactDOM.render(<MouseTracker render={
  props => (
    <React.Fragment>
      <h1>鼠标位置</h1>
      <p>鼠标当前位置：{props.x}, {props.y}</p>
    </React.Fragment>
  )
}>
</MouseTracker>, document.getElementById("root"))
