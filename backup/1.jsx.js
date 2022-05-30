import React from "./react"
import ReactDOM from "./react-dom"
// function FunctionComponent(props) {
//   let element = (
//     <h1 className="title" style={{ color: "red", backgroundColor: "green" }}>
//       {props.message}
//       <span>world</span>
//     </h1>
//   )
//   return element
// }
// let element = <FunctionComponent message={"消息"} age={12} />
class ClassComponent extends React.Component{
	render() {
		let element = (
			<h1 className="title" style={{color: "red", backgroundColor: "green"}}>
				{this.props.message}
				<span>world</span>
			</h1>
		)
		return element
	}
}
let element = <ClassComponent message={"消息"} age={12}/>
ReactDOM.render(element, document.getElementById("root"))
