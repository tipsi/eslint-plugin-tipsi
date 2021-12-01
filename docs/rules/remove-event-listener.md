# bind over developer to write removeEventListener if addEventListener exists (remove-event-listener)

Every `addEventListener` should be paired with `removeEventListener` to avoid memory leaks

## Rule Details

This rule binds over developer to write `removeEventListener` if `addEventListener` exists

### code

Examples of **incorrect** code for this rule:

```js
/* eslint tipsi/remove-event-listener: ["error"] */

class App {
  handleRootNodeClick = () => {
    console.log('click')
  }

  componentDidMount() {
    this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
  }

  render() {
    return (
      <div ref={node => this.rootNodeRef = node} />
    )
  }
}
```
You will get next error:  
```
click on this.rootNodeRef does not have a corresponding removeEventListener
```

```js
/* eslint tipsi/remove-event-listener: ["error"] */

class App {
  handleRootNodeClick = () => {
    console.log('click')
  }

  handleRootNodeKeyPress = () => {
    console.log('keyPress')
  }

  componentDidMount() {
    this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
  }

  componentWillUnmount() {
    this.rootNodeRef.removeEventListener('keypress', this.handleRootNodeKeyPress)
  }

  render() {
    return (
      <div ref={node => this.rootNodeRef = node} />
    )
  }
}
```
You will get next error:  
```
click on this.rootNodeRef does not have a corresponding removeEventListener
```

```js
/* eslint tipsi/remove-event-listener: ["error"] */

class App {
  handleRootNodeClick = () => {
    console.log('click')
  }

  handleRootNodeKeyPress = () => {
    console.log('keyPress')
  }

  componentDidMount() {
    this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
  }

  componentWillUnmount() {
    this.rootNodeRef.removeEventListener('click', this.handleRootNodeKeyPress)
  }

  render() {
    return (
      <div ref={node => this.rootNodeRef = node} />
    )
  }
}
```
You will get next error:  
```
this.handleRootNodeClick and this.handleRootNodeKeyPress on this.rootNodeRef for click do not match
```

```js
/* eslint tipsi/remove-event-listener: ["error"] */

class App {
  handleRootNodeClick = () => {
    console.log('click')
  }

  handleRootNodeTap = () => {
    console.log('click')
  }

  componentDidMount() {
    this.rootNodeRef.addEventListener('click', () => {
      console.log('click')
    })

    this.rootNodeRef.addEventListener('tap', function () {
      console.log('tap')
    })
  }

  componentWillUnmount() {
    this.rootNodeRef.removeEventListener('click', this.handleRootNodeClick)
    this.rootNodeRef.removeEventListener('tap', this.handleRootNodeTap)
  }

  render() {
    return (
      <div ref={node => this.rootNodeRef = node} />
    )
  }
}
```
You will get next errors:  
```
event handler for click on this.rootNodeRef is arrow function arrow functions are prohibited as event handlers
event handler for tap on this.rootNodeRef is plain function plain functions are prohibited as event handlers
```  

```js
/* eslint tipsi/remove-event-listener: ["error"] */

const clickHandler = () => {
  console.log('click')
}

const anotherClickHandler = () => {
  console.log('click')
}

class App {
  componentDidMount() {
    this.rootNodeRef.addEventListener('click', clickHandler)
  }

  componentWillUnmount() {
    this.rootNodeRef.removeEventListener('click', anotherClickHandler)
  }

  render() {
    return (
      <div ref={node => this.rootNodeRef = node} />
    )
  }
}
```
You will get next error:  
```
clickHandler and anotherClickHandler on this.rootNodeRef for click do not match
```  

Example of **correct** code for this rule:

```js
/* eslint tipsi/remove-event-listener: ["error"] */

const handleClack = () => {
  console.log('click clack')
}

class App {
  handleRootNodeClick = () => {
    console.log('click') // eslint-disable-line no-console
  }

  componentDidMount() {
    this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
    this.rootNodeRef.addEventListener('clack', handleClack)
  }

  componentWillUnmount() {
    this.rootNodeRef.removeEventListener('click', this.handleRootNodeClick)
    this.rootNodeRef.removeEventListener('clack', handleClack)
  }

  render() {
    return (
      <div ref={node => this.rootNodeRef = node} />
    )
  }
}
```
