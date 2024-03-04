type Reactive<TValue> = {
    (): TValue
    (newValue: TValue): void
    _dependentReactives: Reactive<any>[]
    _dependentMappers: Mapper<any, any>[]
}

type Mapper<TValue, TMappedValue> = (value: TValue) => TMappedValue

function create<TValue>(value: TValue): Reactive<TValue> {
    function reactive(): TValue
    function reactive(newValue: TValue): void
    function reactive(newValue?: TValue) {
        if (!arguments.length) {
            return value
        }

        value = newValue!

        /* Clone to ensure iteration in intended order */
        const dependentReactives = reactive._dependentReactives.slice()
        const dependentMappers = reactive._dependentMappers.slice()

        dependentReactives.forEach((dependentReactive, index) => {
            dependentReactive(dependentMappers[index](value))
        })
    }

    reactive._dependentReactives = [] as Reactive<any>[]
    reactive._dependentMappers = [] as Mapper<any, any>[]

    return reactive
}

function map<TValue, TMappedValue>(
    reactive: Reactive<TValue>,
    mapper: Mapper<TValue, TMappedValue>
): Reactive<TMappedValue> {
    const target = create(mapper(reactive()))

    reactive._dependentReactives.push(target)
    reactive._dependentMappers.push(mapper)

    return target
}

function join<TValue extends any[]>(
    ...reactives: { [TKey in keyof TValue]: Reactive<TValue[TKey]> }
): Reactive<TValue> {
    if (reactives.length === 1) {
        return reactives[0]
    }

    const values = reactives.map((reactive) => reactive())
    const target = create(values) as unknown as Reactive<TValue>

    reactives.forEach((reactive, index) => {
        reactive._dependentReactives.push(target)
        reactive._dependentMappers.push(createJoinMapper(values.slice(), index));
    })

    return target
}

function createJoinMapper(values: any[], index: number): Mapper<any, any> {
    return (value: any) => {
        values[index] = value
        return values
    }
}

const reactive = {
    create,
    map,
    join,
}

const a = reactive.create('a')
const b = reactive.create(2)
const ab = reactive.map(reactive.join(a, b), ([a, b]) => {
    return `${a}-${b}`
})

console.log(ab())

a('2')

console.log(ab())

const arr = reactive.create(['asd'])
const arr2 = reactive.map(arr, arr => {
    return arr.concat('brr')
})

console.log(arr2())

arr(['whaa'])

console.log(arr2())