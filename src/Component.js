import { REACT_COMPONENT } from './constants'
import { findDOM, compareTwoVdom } from './react-dom'
export const updateQueue = {
	isBatchindgUpdate: false, // 是否出于批量更新模式
	updaters: new Set(),  // 当前更新队列中保存的所有 updater 实例，每个 updater 实例对应一个组件
	batchUpdate() {  // 批量更新的方法
		updateQueue.isBatchingUpdate = false
		for (const updater of updateQueue.updaters) {
			updater.updateComponent()
		}
		updateQueue.updaters.clear()
	}
}
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
		if (updateQueue.isBatchingUpdate) {
			// 如果当前处于批量更新模式，只添加 updater 实例到队列中，并不会进行实际的更新
			updateQueue.updaters.add(this)
		} else {
			this.updateComponent()
		}
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
		pendingStates.forEach(nextState => {
			if (typeof nextState === 'function') {
				nextState = nextState(state)
			}
			state = {...state, ...nextState}
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
	forceUpdate(){ // 只有类组件才有
		let oldRenderVdom = this.oldRenderVdom
		let oldDOM = findDOM(oldRenderVdom)
		let newRenderVdom = this.render()
		compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom)
		this.oldRenderVdom = newRenderVdom
	}
}