type Reactive<TValue> = {
  _dependents: Reactive<any>[]
  _mappers: ((value: any) => any)[]
  get $(): TValue
  set $(newValue: TValue)
}

export function create<TValue>(value: TValue): Reactive<TValue> {
  return {
    _dependents: [],
    _mappers: [],
    get $() {
      return value
    },
    set $(newValue: TValue) {
      value = newValue

      this._dependents.forEach((reactive, index) => {
        reactive.$ = this._mappers[index](value)
      })
    },
  }
}

export function map<TMappedValue>(
  reactiveOrReactives: Reactive<any> | Reactive<any>[],
  mapper: (value: any) => TMappedValue,
) {
  if (Array.isArray(reactiveOrReactives)) {
    return map(join(reactiveOrReactives), mapper)
  }

  const newReactive = create(mapper(reactiveOrReactives))

  reactiveOrReactives._dependents.push(newReactive)
  reactiveOrReactives._mappers.push(mapper)

  return newReactive
}

function join(reactives: Reactive<any>[]) {
  const values = reactives.map((reactive) => reactive.$)
  const newReactive = create(values)

  reactives.forEach((reactive, index) => {
    reactive._dependents.push(newReactive)
    reactive._mappers.push((value) => {
      const valuesClone = values.slice()
      valuesClone[index] = value
      return valuesClone
    })
  })

  return newReactive
}
