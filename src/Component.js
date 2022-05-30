import { REACT_COMPONENT } from './constants'
import { findDOM, compareTwoVdom } from './react-dom'
class Updater {
	constructor(classInstance) {
		this.classInstance = classInstance
		this.pendingStates = []
	}
	addState(partialState) {
		this.pendingStates.push(partialState)
		this.emitUpdate()
	}
	emitUpdate() {
		this.updateComponent()
	}
	/**
	 * 1. 计算新的组件状态
	 * 2. 重新执行组件的 render 方法得到新的虚拟 DOM 
	 * 3. 把新的虚拟 DOM 同步到页面的真实 DOM 上
	 */
	updateComponent() {
		const { classInstance, pendingStates } = this
		// 如果长度 >0 说明有等待生效的更新
		if (pendingStates.length > 0) {
			// 1. 计算新的组件状态
			let newState = this.getState()
			shouldUpdate(classInstance, newState)
		}
	}
	getState() {
		const { classInstance, pendingStates } = this
		// 获取老的状态
		let { state } = classInstance
		pendingStates.forEach(newState => {
			state = {...state, ...newState}
		})
		pendingStates.length = 0
		return state
	}
}
function shouldUpdate(classInstance, newState) {
	classInstance.state = newState
	classInstance.forceUpdate()
}
export class Component { 
	static isReactComponent = REACT_COMPONENT
	constructor(props){
		this.props = props
		this.updater = new Updater(this)
	}
	setState(partialState) {
		this.updater.addState(partialState)
	}
	forceUpdate(){
		let oldRenderVdom = this.oldRenderVdom
		let oldDOM = findDOM(oldRenderVdom)
		let newRenderVdom = this.render()
		compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom)
		this.oldRenderVdom = newRenderVdom
	}
}