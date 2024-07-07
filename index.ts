import { reactive, subscribe } from './topaz'

const firstName = reactive('Paul')
const lastName = reactive('Atreides')

const fullName = subscribe([firstName, lastName], () => {
  return `${firstName.$} ${lastName.$}`
})

const quote = subscribe(fullName, () => {
  return `"He who can destroy a thing, controls a thing." - ${fullName.$}`
})

subscribe(quote, () => {
  console.log(`Quote changed: ${quote.$}`)
})

lastName.$ = "Muad'Dib"