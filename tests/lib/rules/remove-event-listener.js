const { RuleTester } = require('eslint')
const removeEventListener = require('../../../lib/rules/remove-event-listener')

const ruleTester = new RuleTester({ parser: 'babel-eslint' })

ruleTester.run('remove-event-listener', removeEventListener, {
  valid: [{
    code: `
      const handleClack = () => {
        console.log('click clack')
      }

      class App {
        handleRootNodeClick = () => {
          console.log('click') // eslint-disable-line no-console
        }

        componentDidMount() {
          this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
          this.rootNodeRef.addEventListener('clack', handleClickClack)
        }

        componentWillUnmount() {
          this.rootNodeRef.removeEventListener('click', this.handleRootNodeClick)
          this.rootNodeRef.removeEventListener('clack', handleClickClack)
        }

        render() {
          return (
            <div ref={node => this.rootNodeRef = node} />
          )
        }
      }
    `,
  }],
  invalid: [
    {
      code: `
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
      `,
      errors: [{
        message: 'click on this.rootNodeRef does not have a corresponding removeEventListener',
      }],
    },
    {
      code: `
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
      `,
      errors: [{
        message: 'click on this.rootNodeRef does not have a corresponding removeEventListener',
      }],
    },
    {
      code: `
        class App {
          handleRootNodeClick = () => {
            console.log('click')
          }

          handleRootNodeKeyPress = () => {
            console.log('keyPress')
          }

          componentDidMount() {
            window.addEventListener('click', this.handleRootNodeClick)
          }

          componentWillUnmount() {
            window.removeEventListener('click', this.handleRootNodeKeyPress)
          }

          render() {
            return null
          }
        }
      `,
      errors: [{
        message: 'this.handleRootNodeClick and this.handleRootNodeKeyPress ' +
          'on window for click do not match',
      }],
    },
    {
      code: `
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
      `,
      errors: [
        {
          message: 'event handler for click on this.rootNodeRef is arrow function ' +
            'arrow functions are prohibited as event handlers',
        },
        {
          message: 'event handler for tap on this.rootNodeRef is plain function ' +
            'plain functions are prohibited as event handlers',
        },
      ],
    },
    {
      code: `
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
      `,
      errors: [{
        message: 'clickHandler and anotherClickHandler on this.rootNodeRef for click do not match',
      }],
    },
  ],
})
