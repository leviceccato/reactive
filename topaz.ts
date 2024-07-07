type Reactive<TValue> = {
  _dependents: Reactive<any>[]
  _mappers: ((value: any) => any)[]
  get $(): TValue
  set $(newValue: TValue)
}

export function reactive<TValue>(value: TValue): Reactive<TValue> {
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

export function subscribe<TValue>(
  reactiveOrReactives: Reactive<any> | Reactive<any>[],
  runner: (previous: Reactive<TValue>) => TValue,
): Reactive<TValue> {
  if (Array.isArray(reactiveOrReactives)) {
    return subscribe(join(reactiveOrReactives), runner)
  }

  const newReactive = reactive(runner(reactiveOrReactives))

  reactiveOrReactives._dependents.push(newReactive)
  reactiveOrReactives._mappers.push(runner)

  return newReactive
}

function join(reactives: Reactive<any>[]): Reactive<any[]> {
  const values = reactives.map((reactive) => reactive.$)
  const newReactive = reactive(values)

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

type Attrs = Record<string, string>

type Node = {
  tagName: string
  attrs: Attrs
  children: Node[]
}

// export function h<TProps, TTagOrComponent extends string | Component<TProps>>(
//   tagOrComponent: TTagOrComponent,
//   props: TTagOrComponent extends string ? Record<string, unknown> : TProps,
//   children: TTagOrComponent extends string ? 
// ): Node {

// }

export function h(tagName: string, children: Node[]): Node
export function h(tagName: string, attrs: Attrs, children: Node[]): Node {
  return {
    tagName,
    attrs: attrs ?? {},
    children,
  }
}

