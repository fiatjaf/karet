/* eslint-disable */

import * as Kefir from "kefir"
import xs from "xstream"
import * as React from ".."
import {Component} from "react"
import ReactDOM from "react-dom/server"
import PropTypes from "prop-types"

function show(x) {
  switch (typeof x) {
    case "string":
    case "object":
      return JSON.stringify(x)
    default:
      return `${x}`
  }
}

const testRender = (vdom, expect) => it(`${expect}`, () => {
  const actual = ReactDOM.renderToStaticMarkup(vdom)

  if (actual !== expect)
    throw new Error(`Expected: ${show(expect)}, actual: ${show(actual)}`)
})

describe("basics", () => {
  testRender(<p key="k" ref={() => {}}>Hello</p>,
             '<p>Hello</p>')

  testRender(<p id={xs.of("test")}>{null}</p>,
             '<p id="test"></p>')

  testRender(<p key="k" ref={() => {}}>{xs.of("Hello")}</p>,
             '<p>Hello</p>')

  testRender(<p>{[xs.of("Hello")]}</p>,
             '<p>Hello</p>')

  testRender(<p>Just testing <span>constants</span>.</p>,
             '<p>Just testing <span>constants</span>.</p>')

  testRender(<div onClick={() => {}}
                  style={{display: "block",
                          color: Kefir.constant("red").toESObservable(),
                          background: "green"}}>
               <p>{Kefir.constant(["Hello"]).toESObservable()}</p>
               <p>{Kefir.constant(["World"]).toESObservable()}</p>
             </div>,
             '<div style="display:block;color:red;background:green;"><p>Hello</p><p>World</p></div>')

  testRender(<a href="#lol" style={Kefir.constant({color: "red"}).toESObservable()}>
               {Kefir.constant("Hello").toESObservable()} {Kefir.constant("world!").toESObservable()}
             </a>,
             '<a href="#lol" style="color:red;">Hello world!</a>')

  testRender(<div>{Kefir.later(1000,0).toESObservable()}</div>, "")
  testRender(<div>{Kefir.constant(1).merge(Kefir.later(1000, 0)).toESObservable()}</div>, "<div>1</div>")
  testRender(<div>{Kefir.later(1000,0).toESObservable()} {Kefir.constant(0).toESObservable()}</div>, "")

  const Custom = ({prop, ...props}) => <div>{`${prop} ${JSON.stringify(props)}`}</div>

  // testRender(<Custom prop={Kefir.constant("not-lifted").toESObservable()} ref="test"/>,
  //            '<div>[constant] {}</div>')

  testRender(<Custom oaret-lift prop={Kefir.constant("lifted").toESObservable()} ref="test"/>,
             '<div>lifted {}</div>')

  testRender(<Custom oaret-lift prop={"lifted anyway"} ref="test"/>,
             '<div>lifted anyway {}</div>')

  const Spread = props => <div {...props} />

  testRender(<Spread>
               Hello {Kefir.constant("world!").toESObservable()}
             </Spread>,
             '<div>Hello world!</div>')

  testRender(<div><div>a</div>{[<div key="b">b</div>, [<div key="c">c</div>, [<div key="d">d</div>]]]}</div>,
             '<div><div>a</div><div>b</div><div>c</div><div>d</div></div>')

  testRender(<div><div>a</div>{[<div key="b">b</div>, Kefir.constant([<div key="c">c</div>, [<div key="d">d</div>]]).toESObservable()]}</div>,
             '<div><div>a</div><div>b</div><div>c</div><div>d</div></div>')

  const ChildrenWithSibling = ({children}) => <div>Test: {children}</div>

  testRender(<ChildrenWithSibling>
               Hello {Kefir.constant("world!").toESObservable()}
             </ChildrenWithSibling>,
             '<div>Test: Hello world!</div>')

  testRender(<span>0</span>, '<span>0</span>')
  testRender(<span>{Kefir.constant(0).toESObservable()}</span>, '<span>0</span>')
})

describe("fromClass", () => {
  const P = React.fromClass("p")
  testRender(<P $$ref={() => {}}>Hello</P>, '<p>Hello</p>')

  testRender(<P>Hello, {"world"}!</P>, '<p>Hello, world!</p>')
  testRender(<P ref={() => {}}>Hello, {Kefir.constant("world").toESObservable()}!</P>, '<p>Hello, world!</p>')

  testRender(<P>{[Kefir.constant("Hello").toESObservable()]}</P>,
             '<p>Hello</p>')

  testRender(<P>{Kefir.later(1000,0).toESObservable()}</P>, "")
})

describe("context", () => {
  class Context extends Component {
    constructor(props) {
      super(props)
    }
    getChildContext() {
      return this.props.context
    }
    render() {
      return <div>{this.props.children}</div>
    }
  }
  Context.childContextTypes = {message: PropTypes.any}

  const Bottom = (_, context) => <div>{Kefir.constant("Bottom").toESObservable()} {context.message}</div>
  Bottom.contextTypes = {message: PropTypes.any}

  const Middle = () => <div>{Kefir.constant("Middle").toESObservable()} <Bottom/></div>
  const Top = () => <div>{Kefir.constant("Top").toESObservable()} <Middle/></div>

  testRender(<Context context={{message: Kefir.constant("Hello").toESObservable()}}><Top/></Context>,
             "<div><div>Top <div>Middle <div>Bottom Hello</div></div></div></div>")
})
