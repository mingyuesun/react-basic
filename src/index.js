import React from "./react"
import ReactDOM from "./react-dom"
let ThemeContext = React.createContext()
let LanguageContext = React.createContext()
const { Provider, Consumer } = ThemeContext
let style = { margin: "5px", padding: "5px" }

function Title() {
  return (
    <Consumer>
      {(contextValue) => (
        <div style={{ ...style, border: `5px solid ${contextValue.color}` }}>
          Title
        </div>
      )}
    </Consumer>
  )
}
class Header extends React.Component {
  static contextType = ThemeContext
  render() {
    return (
      <LanguageContext.Consumer>
        {(languageContext) => (
          <div style={{ ...style, border: `5px solid ${this.context.color}` }}>
            Header
						{languageContext.language}
            <Title />
          </div>
        )}
      </LanguageContext.Consumer>
    )
  }
}

function Content() {
  return (
    <Consumer>
      {(contextValue) => (
        <div style={{ ...style, border: `5px solid ${contextValue.color}` }}>
          Content
          <button
            style={{ color: "red" }}
            onClick={() => contextValue.changeColor("red")}
          >
            变红
          </button>
          <button
            style={{ color: "green" }}
            onClick={() => contextValue.changeColor("green")}
          >
            变绿
          </button>
        </div>
      )}
    </Consumer>
  )
}
class Main extends React.Component {
  static contextType = ThemeContext
  render() {
    return (
      <div style={{ ...style, border: `5px solid ${this.context.color}` }}>
        Main
        <Content />
      </div>
    )
  }
}
class Page extends React.Component {
  constructor(props) {
    super(props)
    this.state = { color: "black", language: "中文" }
  }
  changeColor = (color) => {
    this.setState({ color })
  }
  render() {
    let contextValue = {
      color: this.state.color,
      changeColor: this.changeColor
    }
    return (
      <LanguageContext.Provider value={{ language: this.state.language }}>
        <Provider value={contextValue}>
          <div
            style={{
              ...style,
              width: "250px",
              border: `5px solid ${this.state.color}`
            }}
          >
            Page
            <Header />
            <Main />
          </div>
        </Provider>
      </LanguageContext.Provider>
    )
  }
}
ReactDOM.render(<Page />, document.getElementById("root"))
