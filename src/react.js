import { REACT_ELEMENT } from './constants'
import { toVdom } from './utils'
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

const React = {
	createElement,
	Component,
	createRef
}

export default React