import { updateQueue } from "./Component"
/**
 * 给 DOM 元素绑定合成事件，在合成事件处理函数中调用用户自定义的处理函数
 * @param {*} dom 真实 DOM
 * @param {*} eventType 事件类型 onclick
 * @param {*} handler 用户自定义的处理函数
 */
export function addEvent(dom, eventType, handler) {
	let store = dom._store_ || (dom._store_ = {})
	// store.onclick = hanlder
	store[eventType] = handler
  if (!document[eventType]) {
		// document.onclick = dispatchEvent
		document[eventType] = dispatchEvent
	}
}

/**
 * 委托给 document 文档对象的处理函数
 * @param {*} event
 */
function dispatchEvent(event) {
	const { type, target } = event
	const eventType = `on${type}`
	// 在方法执行前把 isBatchingUpdate 置为 true
	updateQueue.isBatchingUpdate = true
	let syntheticEvent = createSyntheticEvent(event)
	let currentTarget = target
	// 模拟事件冒泡的过程
	while(currentTarget) {
		// target: 真正的事件源
		// currentTarget: 当前执行过程中的事件源
		syntheticEvent.currentTarget = currentTarget
		let { _store_ } = currentTarget
		// handler 拿到的事件对象不是原生的事件，而是 React 提供的合成事件对象
		// 1. 可以处理兼容性
	  let handler = _store_ && _store_[eventType]
	  handler && handler(syntheticEvent)
		if (syntheticEvent.isPropagationStopped) {
		  break
		}
		currentTarget = currentTarget.parentNode
	}
	
	// 在方法结束后进行批量更新 
	updateQueue.batchUpdate()
}

function createSyntheticEvent(nativeEvent) {
	let syntheticEvent = {}
	for (let key in nativeEvent) {
		let value = nativeEvent[key]
		if (typeof value === 'function') {
			value = value.bind(nativeEvent)
		}
		syntheticEvent[key] = value
	}
	syntheticEvent.nativeEvent = nativeEvent
	syntheticEvent.isPropagationStopped = false  // 是否已经阻止了冒泡
	syntheticEvent.isDefaultPrevented = false  // 是否已经阻止了默认事件
	syntheticEvent.preventDefault = preventDefault
	syntheticEvent.stopPropagation = stopPropagation
	return syntheticEvent
}
function preventDefault() {
	this.isDefaultPrevented = true
	let event = this.nativeEvent
	if (event.preventDefault) {
		event.preventDefault()
	} else {
		event.returnValue = false
	}
}
function stopPropagation() {
	this.isPropagationStopped = true
	let event = this.nativeEvent
	if (event.stopPropagation) {
		event.stopPropagation()
	} else {
		event.cancleBubble = false
	}
}
