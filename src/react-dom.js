import { REACT_TEXT, REACT_COMPONENT, REACT_FORWARD_REF } from "./constants"
import { addEvent } from "./event"
/**
 * 把虚拟 DOM 变成真实 DOM
 * 并插入到父结点中
 * @param {*} vdom
 * @param {*} container
 */
function render(vdom, container) {
  let newDOM = createDOM(vdom)
  container.appendChild(newDOM)
  if (newDOM.componentDidMount) {
    newDOM.componentDidMount()
  }
}

function createDOM(vdom) {
  let { type, props, ref } = vdom
  // 根据不同的虚拟 DOM 类型创建真实 DOM
  let dom
  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return mountForwardComponent(vdom)
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props)
  } else if (typeof type === "function") {
    if (type.isReactComponent === REACT_COMPONENT) {
      return mountClassComponent(vdom)
    } else {
      return mountFunctionComponent(vdom)
    }
  } else {
    dom = document.createElement(type)
  }

  if (typeof props === "object") {
    updateProps(dom, {}, props)
    if (typeof props.children === "object" && props.children.$$typeof) {
      render(props.children, dom)
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom)
    }
  }
  // 当根据虚拟 DOM 创建好真实 DOM 之后，让 vdom.dom = dom
  vdom.dom = dom
  if (ref) ref.current = dom
  return dom
}

function mountForwardComponent(vdom) {
  let { type, props, ref } = vdom
  let renderVdom = type.render(props, ref)
  vdom.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
}

function mountClassComponent(vdom) {
  let { type: ClassComponent, props, ref } = vdom
  // 创建组件的实例
  let classInstance = new ClassComponent(props)
  vdom.classInstance = classInstance
  // 组件将要挂载
  if (classInstance.UNSAFE_componentWillMount) {
    classInstance.UNSAFE_componentWillMount()
  }
  if (ref) ref.current = classInstance
  let renderVdom = classInstance.render()
  // 把类组件渲染的虚拟 DOM 放到类的实例上
  classInstance.oldRenderVdom = vdom.oldRenderVdom = renderVdom
  let dom = createDOM(renderVdom)
  if (classInstance.componentDidMount) {
    dom.componentDidMount = classInstance.componentDidMount.bind(classInstance)
  }
  return dom
}

function mountFunctionComponent(vdom) {
  let { type: FunctionComponent, props } = vdom
  let renderVdom = FunctionComponent(props)
  // 把函数组件渲染的虚拟 DOM 放到函数组件自己的虚拟 DOM 上
  vdom.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
}

function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    render(childrenVdom[i], parentDOM)
  }
}

function updateProps(dom, oldProps = {}, newProps = {}) {
  // 处理新增和修改属性
  for (const key in newProps) {
    if (key === "children") {
      continue
    } else if (key === "style") {
      // style
      let styleObj = newProps[key]
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr]
      }
    } else if (/^on[A-Z].*/.test(key)) {
      // dom[key.toLowerCase()] = newProps[key]
      addEvent(dom, key.toLowerCase(), newProps[key])
    } else {
      // className id
      dom[key] = newProps[key]
    }
  }

  for (const key in oldProps) {
    if (!newProps.hasOwnProperty(key)) {
      delete dom[key]
    }
  }
}

/**
 * 删除或者卸载旧的节点
 * @param {*} oldVdom
 */
function unMountVdom(oldVdom) {
  let {props, ref, classInstance} = oldVdom
  let currentDOM = findDOM(oldVdom)
  if (classInstance && classInstance.componentWillUnmount) {
    classInstance.componentWillUnmount()
  }
  if (ref) {
    ref.current = null
  }
  if (props.children) {
    let children = Array.isArray(props.children) ? props.children : [props.children]
    children.forEach(unMountVdom)
  }
  if (currentDOM) currentDOM.remove()
}

/**
 * 新旧虚拟 DOM 节点进行深度对比
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateElement(oldVdom, newVdom) {
  if (oldVdom.type === REACT_TEXT) {
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    if (oldVdom.props !== newVdom.props) {
      currentDOM.textContent = newVdom.props
    }
  } else if (typeof oldVdom.type === 'string') {
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    updateProps(currentDOM, oldVdom.props, newVdom.props)
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
  } else if (typeof oldVdom.type === 'function') {
    if (oldVdom.type.isReactComponent === REACT_COMPONENT) {
      updateClassComponent(oldVdom, newVdom)
    } else {
      updateFunctionComponent(oldVdom, newVdom)
    }
  }
}

function updateClassComponent(oldVdom, newVdom) {
  const classInstance = newVdom.classInstance = oldVdom.classInstance
  if (classInstance.UNSAFE_componentWillReceiveProps) {
    classInstance.UNSAFE_componentWillReceiveProps()
  }
  classInstance.updater.emitUpdate(newVdom.props)
}

function updateFunctionComponent(oldVdom, newVdom) {
  let currentDOM = findDOM(oldVdom)
  if (!currentDOM) return
  let { type, props } = newVdom
  let newRenderVdom = type(props)
  compareTwoVdom(currentDOM.parentNode, oldVdom.oldRenderVdom, newRenderVdom)
  newVdom.oldRenderVdom = newRenderVdom
}

/**
 * 更新子节点
 * @param {*} parentDOM 父结点真实 DOM
 * @param {*} oldVChildren 旧子节点虚拟 DOM 数组
 * @param {*} newVChildren 新子节点虚拟 DOM 数组
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  oldVChildren = Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren]  
  newVChildren = Array.isArray(newVChildren) ? newVChildren : [newVChildren]
  const maxLength = Math.max(oldVChildren.length, newVChildren.length)
  for (let i = 0; i < maxLength; i++) {
    let nextVdom = oldVChildren.find((item, index) => index > i && item && findDOM(item))
    compareTwoVdom(parentDOM, oldVChildren[i], newVChildren[i], findDOM(nextVdom))
  }
}

/**
 * 根据虚拟 DOM 获取真实 DOM
 * @param {*} vdom
 */
export function findDOM(vdom) {
  if (!vdom) return null
  if (vdom.dom) {
    return vdom.dom
  } else {
    let renderVdom = vdom.classInstance ? vdom.classInstance.oldRenderVdom : vdom.oldRenderVdom
    return findDOM(renderVdom)
  }
}

export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  // 新旧都没有
  if (!oldVdom && !newVdom) {
    return
  // 如果旧的节点存在，新的节点不存在，需要直接删除旧的节点
  } else if (oldVdom && !newVdom) {
    unMountVdom(oldVdom)
  } else if (!oldVdom && newVdom) {
    let newDOM = createDOM(newVdom)
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM)
    } else {
      parentDOM.appendChild(newDOM) // BUG
    }
    if (newDOM.compoentDidMount) {
      newDOM.compoentDidMount()
    }
  } else if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    unMountVdom(oldVdom)
    let newDOM = createDOM(newVdom)
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM)
    } else {
      parentDOM.appendChild(newDOM) // BUG
    }
    if (newDOM.compoentDidMount) {
      newDOM.compoentDidMount()
    }
  } else { // 旧的节点有值，新的节点有值，且类型相同，复用，更新属性
    updateElement(oldVdom, newVdom)    
  }
}

const ReactDOM = {
  render
}

export default ReactDOM
