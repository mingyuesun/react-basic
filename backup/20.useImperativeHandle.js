import React from "./react"
import ReactDOM from "./react-dom"

function Child(props, ref) {
  const childInputRef = React.useRef()
  React.useImperativeHandle(ref, () => ({
    focus(){
      childInputRef.current.focus()
    }
  }))
  return <input type="text" ref={childInputRef}/>
}
const ForwardChild = React.forwardRef(Child)
function Parent() {
  const inputRef = React.useRef()
  const getFocus = () => {
    console.log(inputRef.current)
    inputRef.current.value = 'focus'
    inputRef.current.focus()
  }
  return (
    <div>
      <ForwardChild ref={inputRef}/>
      <button onClick={getFocus}>获得焦点</button>
    </div>
  )
}

ReactDOM.render(<Parent/>, document.getElementById("root"))
