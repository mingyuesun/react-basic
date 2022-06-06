import React from "./react"
import ReactDOM from "./react-dom"

let ADD = 'ADD'
let MINUS = 'MINUS'
const initialState = {number: 0}

function reducer(state = initialState, action) {
  switch(action.type) {
    case ADD:
      return {number: state.number + 1};
    case MINUS:
      return {number: state.number - 1};
    default:
      return state
  }
}

function Counter(){
  const [state, dispatch] = React.useReducer(reducer, initialState)
  return (
    <div>
      <p>{state.number}</p>
      <button onClick={() => dispatch({type: ADD})}>+</button>
      <button onClick={() => dispatch({type: MINUS})}>-</button>
    </div>
  )
}

ReactDOM.render(<Counter/>, document.getElementById("root"))
