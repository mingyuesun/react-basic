import { REACT_TEXT, REACT_COMPONENT, REACT_FORWARD_REF, REACT_FRAGMENT, MOVE, PLACEMENT, REACT_PROVIDER, REACT_CONTEXT, REACT_MEMO } from "./constants"
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
  if (type && type.$$typeof === REACT_MEMO) {
    return mountMemoComponent(vdom)
  } else if (type && type.$$typeof === REACT_PROVIDER) { 
    return mountProviderComponent(vdom)
  } else if (type && type.$$typeof === REACT_CONTEXT) {
    return mountContextComponent(vdom)
  } else if (type && type.$$typeof === REACT_FORWARD_REF) {
    return mountForwardComponent(vdom)
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props)
  } else if (type === REACT_FRAGMENT) {
    dom = document.createDocumentFragment(props)
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
      props.children.mountIndex = 0
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

function mountMemoComponent(vdom) {
  let {type, props} = vdom
  let renderVdom = type.type(props)
  // vdom.prevProps = props
  vdom.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
}

/**
 * 1.把属性中的值存放到 Provider._currentValue 上
 * 2.渲染它的子节点
 * @param {*} vdom
 */
function mountProviderComponent(vdom) {
  let { type, props } = vdom
  let context = type._context  // Provider._context
  context._currentValue = props.value
  let renderVdom = props.children
  vdom.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
}

function mountContextComponent(vdom) {
  let { type, props } = vdom
  let context = type._context
  let renderVdom = props.children(context._currentValue)
  vdom.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
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
  if (ClassComponent.contextType) {
    classInstance.context = ClassComponent.contextType._currentValue
  }
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
    childrenVdom[i].mountIndex = i
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
    let children = (Array.isArray(props.children) ? props.children : [props.children]).filter(item => typeof item !== 'undefined' || item !== null)
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
  if (oldVdom.type.$$typeof === REACT_MEMO) {
    updateMemoComponent(oldVdom, newVdom)
  }else if (oldVdom.type.$$typeof === REACT_PROVIDER) {
    updateProviderComponent(oldVdom, newVdom)
  } else if (oldVdom.type.$$typeof === REACT_CONTEXT) {
    updateContextComponent(oldVdom, newVdom)
  } else if (oldVdom.type === REACT_TEXT) {
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    if (oldVdom.props !== newVdom.props) {
      currentDOM.textContent = newVdom.props
    }
  } else if (typeof oldVdom.type === 'string') {
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    updateProps(currentDOM, oldVdom.props, newVdom.props)
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
  } else if (oldVdom.type === REACT_FRAGMENT) {
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
  } else if (typeof oldVdom.type === 'function') {
    if (oldVdom.type.isReactComponent === REACT_COMPONENT) {
      updateClassComponent(oldVdom, newVdom)
    } else {
      updateFunctionComponent(oldVdom, newVdom)
    }
  }
}

function updateMemoComponent(oldVdom, newVdom){
  let { type, prevProps } = oldVdom
  // 属性相等，不用更新
  if (type.compare(prevProps, newVdom.props)) {
    newVdom.prevProps = prevProps
    newVdom.oldRenderVdom = oldVdom.oldRenderVdom
  // 属性不相等，需要更新
  } else {
    let oldDOM = findDOM(oldVdom)
    let parentDOM = oldDOM.parentNode
    let {type, props} = newVdom
    let renderVdom = type.type(props)
    compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom)
    newVdom.prevProps = props
    newVdom.oldRenderVdom = renderVdom
  }
}

function updateProviderComponent(oldVdom, newVdom) {
  let currentDOM = findDOM(oldVdom)
  let parentDOM = currentDOM.parentNode
  let { type, props } = newVdom
  let context = type._context
  context._currentValue = props.value
  let renderVdom = props.children
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom)
  newVdom.oldRenderVdom = renderVdom
}

function updateContextComponent(oldVdom, newVdom) {
  let currentDOM = findDOM(oldVdom)
  let parentDOM = currentDOM.parentNode
  let { type, props } = newVdom
  let context = type._context
  let renderVdom = props.children(context._currentValue)
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom)
  newVdom.oldRenderVdom = renderVdom
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
  oldVChildren = (Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren]).filter(item => typeof item !== 'undefined' && item !== null)
  newVChildren = (Array.isArray(newVChildren) ? newVChildren : [newVChildren]).filter(item => typeof item !== 'undefined' && item !== null)
  let keyedOldMap = {}
  let lastPlaceIndex = 0
  oldVChildren.forEach((oldVChild, index) => {
    let oldKey = oldVChild.key ? oldVChild.key : index
    keyedOldMap[oldKey] =  oldVChild
  })  
  let patch = []
  newVChildren.forEach((newVChild, index) => {
    newVChild.mountIndex = index
    let newKey = newVChild.key ? newVChild.key : index
    let oldVChild = keyedOldMap[newKey]
    if (oldVChild) {
      updateElement(oldVChild, newVChild)
      if (oldVChild.mountIndex < lastPlaceIndex) {
        patch.push({
          type: MOVE,
          oldVChild,
          newVChild,
          mountIndex: index
        })
      }
      delete keyedOldMap[newKey]
      lastPlaceIndex = Math.max(lastPlaceIndex, oldVChild.mountIndex)
    } else {
      patch.push({
        type: PLACEMENT,
        newVChild,
        mountIndex: index
      })
    }
  })
  let moveVChild = patch.filter(action => action.type === MOVE).map(action => action.oldVChild)
  Object.values(keyedOldMap).concat(moveVChild).forEach(oldVChild => {
    let currentDOM = findDOM(oldVChild)
    parentDOM.removeChild(currentDOM)
  })
  patch.forEach(action => {
    let {type, oldVChild, newVChild, mountIndex} = action
    let childNodes = parentDOM.childNodes
    if (type === PLACEMENT) {
      let newDOM = createDOM(newVChild)
      let childNode = childNodes[mountIndex]
      if (childNode) {
        parentDOM.insertBefore(newDOM, childNode)
      } else {
        parentDOM.appendChild(newDOM)
      }
    } else if (type === MOVE) {
      let oldDOM = findDOM(oldVChild)
      let childNode = childNodes[mountIndex]
      if (childNode) {
        parentDOM.insertBefore(oldDOM, childNode)
      } else {
        parentDOM.appendChild(oldDOM)
      }
    }
  })
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
