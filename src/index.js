import React from "./react"
import ReactDOM from "./react-dom"

class Button extends React.Component {
  state = { name: 'zhangsan' }
  UNSAFE_componentWillMount() {
    console.log('Button componentWillMount')
  }
  componentDidMount() {
    console.log('Button componentDidMount')
  } 
  render(){
    console.log('Button render')
    return (
      <button name={this.state.name} title={this.props.title}/>
    )
  }
}
const wrapper = OldComponent => {
  return class NewComponent extends OldComponent {
    state = {number: 0}
    UNSAFE_componentWillMount() {
      console.log('WrapperButton componentWillMount')
      super.UNSAFE_componentWillMount()
    }
    componentDidMount() {
      console.log('WrapperButton componentDidMount')
      super.componentDidMount()
    }
    handleClick = () => {
      this.setState({number: this.state.number + 1})
    }
    render() {
      console.log('WrapperButton render')
      let renderElement = super.render()
      let newProps = {
        ...renderElement.props,
        ...this.state,
        onClick: this.handleClick
      }
      return React.cloneElement(renderElement, newProps, this.state.number)
    }
  }
}
let WrapperButton = wrapper(Button)
ReactDOM.render(<WrapperButton title="标题" />, document.getElementById("root"))
