import React from "./react"
import ReactDOM from "./react-dom"

class Dialog extends React.Component {
  constructor(props) {
    super(props)
    this.node = document.createElement('div')
    document.body.appendChild(this.node)
  }
  componentWillUnmount() {
    window.document.body.removeChild(this.node)
  }
  render() {
    return ReactDOM.createPortal(<div className="dialog">{this.props.children}</div>, this.node)
  }
}
class App extends React.Component {
  render() {
    return (
      <div>
        <Dialog children={"Dialog"}/>
      </div>
    )
  }
}
ReactDOM.render(<App/>, document.getElementById("root"))
