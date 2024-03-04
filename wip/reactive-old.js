export function create(value) {
  function reactive(newValue) {
    if (!arguments.length) {
      return value
    }

    value = newValue

    /* Clone to ensure iteration in intended order */
    const dependentReactives = reactive._dependentReactives.slice()
    const dependentMappers = reactive._dependentMappers.slice()

    dependentReactives.forEach((dependentReactive, index) => {
      dependentReactive(dependentMappers[index](value))
    })
  }

  reactive._dependentReactives = []
  reactive._dependentMappers = []

  return reactive
}

export function map(reactive, mapper) {
  if (Array.isArray(reactive)) {
    return map(join(reactive), mapper)
  }

  const target = create(mapper(reactive()))

  reactive._dependentReactives.push(target)
  reactive._dependentMappers.push(mapper)

  return target
}

function join(reactives) {
  if (reactives.length === 1) {
    return reactives[0]
  }

  const values = reactives.map((reactive) => reactive())
  const target = create(values)

  reactives.forEach((reactive, index) => {
    reactive._dependentReactives.push(target)
    reactive._dependentMappers.push((value) => {
      const valuesClone = values.slice()
      valuesClone[index] = value
      return valuesClone
    })
  })

  return target
}
