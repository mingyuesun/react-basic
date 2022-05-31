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
		this.callbacks = []
	}
	addState(partialState, callback ) {
		this.pendingStates.push(partialState)
		if (callback) {
			this.callbacks.push(callback)
		}
		this.emitUpdate()
	}
	emitUpdate(nextProps) {
		this.nextProps = nextProps
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
		const { classInstance, pendingStates, callbacks, nextProps } = this
		// 如果长度 >0 说明有等待生效的更新
		if (nextProps || pendingStates.length > 0) {
			// 1. 计算新的组件状态
			let nextState = this.getState()
			shouldUpdate(classInstance, nextProps, nextState)
		}
		// or process.nextTick
		queueMicrotask(() => {
			callbacks.forEach(callback => callback.call(this))
			callbacks.length = 0
		})
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
function shouldUpdate(classInstance, nextProps, nextState) {
	let willUpdate = true
	// 有 shouldComponentUpdate 方法，且执行结果为 false，才不更新
	// 暂时没有处理 props 的更新 => 已处理 nextProps
	if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, nextState)) {
		willUpdate = false
	}
	if (willUpdate && classInstance.UNSAFE_componentWillUpdste) {
		classInstance.UNSAFE_componentWillUpdste()
	}
	if (nextProps) {
		classInstance.props = nextProps
	}
	// 无论实例数据要不要更新，实例 state 数据都会改变，都会指向新的状态
	classInstance.state = nextState
	if (willUpdate) {
		classInstance.forceUpdate()
	}
}
export class Component { 
	static isReactComponent = REACT_COMPONENT
	constructor(props){
		this.props = props
		this.updater = new Updater(this)
	}
	setState(partialState, callback) {
		this.updater.addState(partialState, callback)
	}
	forceUpdate(){ // 只有类组件才有
		let oldRenderVdom = this.oldRenderVdom
		let oldDOM = findDOM(oldRenderVdom)
		let newRenderVdom = this.render()
		compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom)
		this.oldRenderVdom = newRenderVdom
		if (this.componentDidUpdate) {
			this.componentDidUpdate(this.props, this.state)
		}
	}
}