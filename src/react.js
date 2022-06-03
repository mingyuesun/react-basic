import { REACT_ELEMENT, REACT_FORWARD_REF, REACT_FRAGMENT, REACT_PROVIDER, REACT_CONTEXT, REACT_MEMO } from './constants'
import { toVdom, shallowEqual } from './utils'
import { Component } from './Component'
console.log('self react')
function createElement(type, config, children){
	let ref
	let key
	if (config) {
		ref = config.ref
		key = config.key
		delete config.__self
		delete config.__source
		delete config.ref
		delete config.key
	}
	let props = {...config}
	if (arguments.length > 3) {
		props.children = Array.prototype.slice.call(arguments, 2).map(toVdom)
	} else if (arguments.length === 3) {
		props.children = toVdom(children)
	}
	return {
		$$typeof: REACT_ELEMENT,
		type,
		props,
		ref,
		key
	}
}

function createRef() {
	return {current: null}
}

function forwardRef(render) {
	return {
		$$typeof: REACT_FORWARD_REF,
		render
	}
}

function createContext() {
	let context = {
		$$typeof: REACT_CONTEXT,
		_currentValue: undefined
	}
	context.Provider = {
		$$typeof: REACT_PROVIDER,
		_context: context
	}
	context.Consumer = {
		$$typeof: REACT_CONTEXT,
		_context: context
	}
	return context
}

function cloneElement(element, newProps, ...newChildren) {
	 let oldChildren = element.props && element.props.children
	 let children = [...(Array.isArray(oldChildren) ? oldChildren : [oldChildren]), ...newChildren].filter(child => child !== undefined).map(toVdom)
	 if (children.length === 1) children = children[0]
	 let props = {...element.props, ...newProps, children}
	 return {...element, props}
}

// shallowEqual
class PureComponent extends Component {
	shouldComponentUpdate(newProps, nextState) {
		return !shallowEqual(this.props, newProps) || !shallowEqual(this.state, nextState)
	}
}

function memo(type, compare=shallowEqual) {
	return {
		$$typeof: REACT_MEMO,
		type,
		compare
	}
}

const React = {
	createElement,
	Component,
	createRef,
	forwardRef,
	Fragment: REACT_FRAGMENT,
	createContext,
	cloneElement,
	PureComponent,
	memo
}

export default React