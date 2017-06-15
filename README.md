[ [≡](#contents) | [Tutorial](#tutorial) | [Reference](#reference) ]

# Oaret

Oaret is a library that allows you to
embed observables
into [React](https://facebook.github.io/react/) Virtual DOM.  Embedding
observables into VDOM has the following benefits:
* It allows you to use
  only
  [functional components](https://facebook.github.io/react/docs/components-and-props.html#functional-and-class-components),
  because you can then use observables for managing state
  and [`ref`](https://facebook.github.io/react/docs/refs-and-the-dom.html) for
  component lifetime, leading to more **_concise code_**.
* It helps you to use React in an **_algorithmically efficient_** way:
  * The body of a functional component is evaluated only once each time the
    component is mounted.
    * This also helps you to avoid issues such as
      the
      [gotcha with ref](https://facebook.github.io/react/docs/refs-and-the-dom.html#caveats).
  * Only elements that contain embedded observables are rerendered when changes
    are pushed through observables.  An update to a deeply nested VDOM element
    can be an O(1) operation.

Using Oaret couldn't be simpler.  You just `import * as React from "oaret"` and
you are good to go.

[![npm version](https://badge.fury.io/js/oaret.svg)](http://badge.fury.io/js/oaret)
[![Build Status](https://travis-ci.org/fiatjaf/oaret.svg?branch=master)](https://travis-ci.org/fiatjaf/oaret)

## Contents

* [Tutorial](#tutorial)
* [Reference](#reference)
  * [`oaret-lift` attribute](#oaret-lift)
  * [`fromClass(Component)`](#fromClass "fromClass: Component props -> Component (Observable props)")
    * [`$$ref` attribute](#ref)

## Tutorial

To use Oaret, you simply import it as `React`:

```jsx
import * as React from "oaret"
```

and you can then write React components:

```jsx
const oncePerSecond = Kefir.interval(1000).toProperty(() => {})

const Clock = () =>
  <div>
    The time is {oncePerSecond.map(() => new Date().toString())}.
  </div>
```

with VDOM that can have embedded [Kefir](http://rpominov.github.io/kefir/)
observables.  This works because Oaret exports an enhanced version of
`createElement`.

**NOTE:** Oaret does not pass through other named React exports.  Only
`createElement` is exported, which is all that is needed for basic use of VDOM
or the Babel JSX transform.

**NOTE:** The result, like the `Clock` above, is *just* a React component.  If
you export it, you can use it just like any other React component and even in
modules that do not import `oaret`.

## Reference

### <a name="oaret-lift"></a> [≡](#contents) [`oaret-lift` attribute](#oaret-lift)

Oaret only lifts built-in HTML elements implicitly.  The `oaret-lift` attribute
on a non-primitive element instructs Oaret to lift the element.

For example, you could write:

```jsx
import * as RR    from "react-router"
import * as React from "oaret"

const Link1 = ({...props}) => <RR.Link oaret-lift {...props}/>
```

to be able to use `Link1` with
embedded [Kefir](http://rpominov.github.io/kefir/) observables:

```jsx
<Link1 href="https://www.youtube.com/watch?v=Rbm6GXllBiw"
       ref={elem => elem && elem.focus()}>
  {Kefir.sequentially(1000, [3, 2, 1, "Boom!"])}
</Link1>
```

Note that the `ref` attribute is only there as an example to contrast
with [`$$ref`](#ref).

### <a name="fromClass"></a> [≡](#contents) [`fromClass(Component)`](#fromClass "fromClass: Component props -> Component (Observable props)")

`fromClass` allows one to lift a React component.

For example:

```jsx
import * as RR from "react-router"
import {fromClass} from "oaret"

const Link2 = fromClass(RR.Link)
```

**WARNING:** A difficulty with lifting components is that you will then need to
use the [`$$ref`](#ref) attribute, which is not necessary when
using [`oaret-lift`](#oaret-lift) to lift an element.

#### <a name="ref"></a> [≡](#contents) [`$$ref` attribute](#ref)

The `$$ref` attribute on an element whose component is lifted using `fromClass`

```jsx
<Link2 href="https://www.youtube.com/watch?v=Rbm6GXllBiw"
       $$ref={elem => elem && elem.focus()}>
  {Kefir.sequentially(1000, [3, 2, 1, "Boom!"])}
</Link2>
```

does the same thing as the ordinary
JSX
[`ref` attribute](https://facebook.github.io/react/docs/more-about-refs.html#the-ref-callback-attribute):
JSX/React treats `ref` as a special case and it is not passed to components, so
a special name had to be introduced for it.
