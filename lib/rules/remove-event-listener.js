const get = require('lodash/get')

/**
 * @fileoverview Rule to bind over developer write removeEventListener if addEventListener exists
 * @author Anton Kuznetsov
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const ADD_EVENT_LISTENER = 'addEventListener'
const REMOVE_EVENT_LISTENER = 'removeEventListener'

const PLAIN_FUNCTION = 'plain function'
const ARROW_FUNCTION = 'arrow function'
const PROHIBITED_HANDLERS = {
  [PLAIN_FUNCTION]: true,
  [ARROW_FUNCTION]: true,
}

module.exports = {
  meta: {
    docs: {
      description: 'remove event listener if addEventListener exists',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/tipsi/eslint-plugin-tipsi',
    },
    schema: [], // no options
  },
  create: (context) => {
    const listeners = {}

    const isNodeMemberExpression = node => get(node, 'type') === 'MemberExpression'
    const isNodeThisExpression = node => get(node, 'type') === 'ThisExpression'
    const isNodeFunctionExpression = node => get(node, 'type') === 'FunctionExpression'
    const isNodeArrowFunctionExpression = node => get(node, 'type') === 'ArrowFunctionExpression'

    const parseMemberExpression = (node) => {
      let value

      if (isNodeMemberExpression(node.object)) {
        value = parseMemberExpression(node.object)
      }

      if (isNodeThisExpression(node.object)) {
        value = `this.${node.property.name}`
      }

      return value
    }

    const isNodeIdentifier = node => get(node, 'type') === 'Identifier'
    const isCalleePropertyAddEventListener = property => (
      get(property, 'name') === ADD_EVENT_LISTENER && ADD_EVENT_LISTENER
    )
    const isCalleePropertyRemoveEventListener = property => (
      get(property, 'name') === REMOVE_EVENT_LISTENER && REMOVE_EVENT_LISTENER
    )

    return {
      'CallExpression:exit': (node) => {
        if (isNodeMemberExpression(node.callee)) {
          const listenerType = (
            isCalleePropertyAddEventListener(node.callee.property) ||
            isCalleePropertyRemoveEventListener(node.callee.property)
          )

          if (listenerType === ADD_EVENT_LISTENER || listenerType === REMOVE_EVENT_LISTENER) {
            const elementToListen = parseMemberExpression(node.callee)
            const eventToListen = node.arguments[0].value
            let handler = node.arguments[1]

            if (isNodeFunctionExpression(handler)) {
              handler = PLAIN_FUNCTION
            } else if (isNodeArrowFunctionExpression(handler)) {
              handler = ARROW_FUNCTION
            } else if (isNodeIdentifier(handler)) {
              handler = handler.name
            } else {
              handler = parseMemberExpression(handler)
            }

            const currentTypeListeners = listeners[listenerType] || {}
            listeners[listenerType] = {
              ...currentTypeListeners,
              [elementToListen]: {
                ...currentTypeListeners[elementToListen],
                [eventToListen]: {
                  handler,
                  loc: node.loc,
                },
              },
            }
          }
        }
      },
      'Program:exit': () => {
        const reportAboutCorrespondingListener = (elementToListen, eventName, loc) => {
          context.report({
            loc,
            message: `${eventName} on ${elementToListen} does not have ` +
              'a corresponding removeEventListener',
          })
        }

        const reportAboutListenersThatDoNoMatch = (params) => {
          const { elementToListen, eventName, add, remove, loc } = params

          context.report({
            loc,
            message: `${add} and ${remove} on ${elementToListen} for ${eventName} do not match`,
          })
        }

        const reportAboutProhibitedListeners = (elementToListen, eventName, type, loc) => {
          context.report({
            loc,
            message: `event handler for ${eventName} on ${elementToListen} is ${type} ` +
              `${type}s are prohibited as event handlers`,
          })
        }

        /*
          How it looks like

          addEventListener: {
            'this.rootNodeRef': {
              click: {
                handler: 'this.handleRootNodeClick',
                loc: { ... },
              }
            }
          }
         */
        const { addEventListener = {}, removeEventListener = {} } = listeners

        Object.keys(addEventListener).forEach((elementToListen) => {
          const arrayAddEventsOnElement = Object.entries(addEventListener[elementToListen])
          const removeEventsOnElement = removeEventListener[elementToListen]

          arrayAddEventsOnElement.forEach(([eventName, { handler, loc }]) => {
            if (!removeEventsOnElement || !removeEventsOnElement[eventName]) {
              // 1. If element does not have removeEventListeners at all
              // 2. If removeEventListener does not exist for current event
              reportAboutCorrespondingListener(elementToListen, eventName, loc)
            } else if (PROHIBITED_HANDLERS[handler]) {
              // 3. If removeEventListener is plain function or arrow function
              reportAboutProhibitedListeners(elementToListen, eventName, handler, loc)
            } else if (removeEventsOnElement[eventName].handler !== handler) {
              // 4. If handlers are different
              reportAboutListenersThatDoNoMatch({
                elementToListen,
                eventName,
                add: handler,
                remove: removeEventsOnElement[eventName].handler,
                loc,
              })
            }
          })
        })
      },
    }
  },
}
