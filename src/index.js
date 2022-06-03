import React from "react"
import ReactDOM from "react-dom"

function withTracker(OldComponent) {
  return class MouseTracker extends React.Component {
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
          <OldComponent {...this.state}/>
        </div>
      )
    }
  }
}

function Show(props) {
  return (
    <React.Fragment>
      <h1>鼠标位置</h1>
      <p>鼠标当前位置：{props.x}, {props.y}</p>
    </React.Fragment>
  )
}
let HighShow = withTracker(Show)
ReactDOM.render(<HighShow/>, document.getElementById("root"))
