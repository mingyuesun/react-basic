import { REACT_ELEMENT } from './constants'
import { toVdom } from './utils'
import { Component } from './Component'
console.log('self react')
function createElement(type, config, children){
	if (config) {
		delete config.__self
		delete config.__source
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
		props
	}
}

const React = {
	createElement,
	Component
}

export default React