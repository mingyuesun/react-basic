import { REACT_COMPONENT } from './constants'
export class Component {
	static isReactComponent = REACT_COMPONENT
	constructor(props){
		this.props = props
	}
}