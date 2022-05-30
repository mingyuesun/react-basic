import { REACT_TEXT, REACT_COMPONENT } from './constants'
import { addEvent } from './event'
/**
 * 把虚拟 DOM 变成真实 DOM
 * 并插入到父结点中
 * @param {*} vdom
 * @param {*} container
 */
function render(vdom, container) {
	let newDOM = createDOM(vdom)
	container.appendChild(newDOM)
}

function createDOM(vdom) {
	let { type, props, ref } = vdom
	// 根据不同的虚拟 DOM 类型创建真实 DOM
	let dom
	if (type === REACT_TEXT){
		dom = document.createTextNode(props)
	} else if (typeof type === 'function') {
		if (type.isReactComponent === REACT_COMPONENT) {
			return mountClassComponent(vdom)
		} else {
			return mountFunctionComponent(vdom)
		}
	} else {
		dom = document.createElement(type)
	}

	if(props) {
		updateProps(dom, {}, props)
		if (props.children) {
			if (typeof props.children === 'object' && props.children.$$typeof) {
				render(props.children, dom)
			} else if (Array.isArray(props.children)) {
				reconcileChildren(props.children, dom)
			}
		}
	}
	// 当根据虚拟 DOM 创建好真实 DOM 之后，让 vdom.dom = dom
	vdom.dom = dom
	if (ref) ref.current = dom
	return dom
}

function mountClassComponent(vdom)  {
	let {type: ClassComponent, props, ref} = vdom
	let classInstance = new ClassComponent(props)
	if (ref) ref.current = classInstance
	let renderVdom = classInstance.render()
	// 把类组件渲染的虚拟 DOM 放到类的实例上
	classInstance.oldRenderVdom =  vdom.oldRenderVdom = renderVdom
	return createDOM(renderVdom)
}

function mountFunctionComponent(vdom) {
	let {type: FunctionComponent, props} = vdom
	let renderVdom = FunctionComponent(props)
	// 把函数组件渲染的虚拟 DOM 放到函数组件自己的虚拟 DOM 上
	vdom.oldRenderVdom = renderVdom
	return createDOM(renderVdom)
}

function reconcileChildren(childrenVdom, parentDOM) {
	 for(let i = 0; i < childrenVdom.length; i++) {
		 render(childrenVdom[i], parentDOM)
	 }
}

function updateProps(dom, oldProps = {}, newProps = {}) {
	// 处理新增和修改属性
	for(const key in newProps) {
		if (key === 'children') {
			continue
		} else if (key === 'style') { // style
			let styleObj = newProps[key]
			for (let attr in styleObj) {
				dom.style[attr] = styleObj[attr]
			}
		} else if (/^on[A-Z].*/.test(key)) {
			  // dom[key.toLowerCase()] = newProps[key]
				addEvent(dom, key.toLowerCase(), newProps[key])
		} else {  // className id
			dom[key] = newProps[key]
		}
	}

	for (const key in oldProps) {
		if(!newProps.hasOwnProperty(key)) {
			delete dom[key]
		}
	}
}

/**
 * 根据虚拟 DOM 获取真实 DOM 
 * @param {*} vdom
 */
export function findDOM(vdom) {
	 if(!vdom) return null
	 if (vdom.dom) {
		 return vdom.dom
	 } else {
		 let renderVdom = vdom.oldRenderVdom
		 return findDOM(renderVdom)
	 }
}

export function compareTwoVdom(parentDOM, oldVdom, newVdom) {
	let oldDOM = findDOM(oldVdom)
	let newDOM = createDOM(newVdom)
	parentDOM.replaceChild(newDOM, oldDOM)
}

const ReactDOM = {
	render
}

export default ReactDOM