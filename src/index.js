import React from "react"
import ReactDOM from "react-dom"
class ScrollingList extends React.Component {
	constructor(props) {
		super(props)
		this.state = {messages: []}
		this.wrapper = React.createRef()
	}
	addMessage = () => {
		this.setState(state => ({
			messages: [`${state.messages.length}`, ...state.messages]
		}))
	}
	componentDidMount() {
		this.timeID = window.setInterval(() => {
			this.addMessage()
		}, 1000)
	}
	componentWillUnmount() {
		window.clearInterval(this.timeID)
	}
	getSnapshotBeforeUpdate() {
		return {prevScrollTop: this.wrapper.current.scrollTop, prevScrollHeight: this.wrapper.current.scrollHeight}
	}	
	componentDidUpdate(prevProps, prevState, {prevScrollTop, prevScrollHeight}) {	
		this.wrapper.current.scrollTop = prevScrollTop + (this.wrapper.current.scrollHeight - prevScrollHeight)
	}
	render() {
		let style = {
			height: '100px',
			width: '200px',
			border: '1px solid red',
			overflow: 'auto'
		}
		return (	
			<div style={style} ref={this.wrapper}>
				{this.state.messages.map((message, index) => 
					<div key={index}>{message}</div>
				)}
			</div>
		)
	}
}
ReactDOM.render(<ScrollingList />, document.getElementById("root"))