import * as reactive from './reactive'

const firstName = reactive.create('Paul')
const lastName = reactive.create('Atreides')

const fullName = reactive.map([firstName, lastName], () => {
  return `${firstName()} ${lastName()}`
})

const quote = reactive.map(fullName, () => {
  return `"He who can destroy a thing, controls a thing." - ${fullName()}`
})
