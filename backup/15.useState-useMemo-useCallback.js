import React from "./react"
import ReactDOM from "./react-dom"

function Child({data, handleClick}) {
  console.log('Child render')
  return <button onClick={handleClick}>{data.number}</button>
}

let MemoChild = React.memo(Child)

function App() {
  console.log('App render')
  let [name, setName] = React.useState('test')
  let [number, setNumber] = React.useState(0)
  // 如果依赖的变量发生了改变，就会重新执行方法得到新对象；
  // 如果没有改变，那就不会执行方法获取新的对象了，会复用旧的对象
  let data = React.useMemo(() => ({number}), [number]) 
  const handleClick = React.useCallback(() => setNumber(number+1), [number])
  return (
    <div>
      <input type="text" value={name} onChange={event => setName(event.target.value)}/>
      <MemoChild data={data} handleClick={handleClick}/>
    </div>
  )
}

ReactDOM.render(<App/>, document.getElementById("root"))
