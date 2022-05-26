import { REACT_TEXT, REACT_COMPONENT } from './constants'
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
	let { type, props } = vdom
	// 根据不同的虚拟 DOM 类型创建真实 DOM
	let dom
	if (type === REACT_TEXT){
		dom = document.createTextNode(props)
	} else if (typeof type === 'function') {
		console.log(type.isReactComponent)
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
	return dom
}

function mountClassComponent(vdom)  {
	let {type: ClassComponent, props} = vdom
	let classInstance = new ClassComponent(props)
	let renderVdom = classInstance.render()
	return createDOM(renderVdom)
}

function mountFunctionComponent(vdom) {
	let {type: FunctionComponent, props} = vdom
	let renderVdom = FunctionComponent(props)
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

const ReactDOM = {
	render
}

export default ReactDOM