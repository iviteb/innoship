export const COURIERS_SCHEMA = {
    'properties': {
        'data': {
            'type': 'array',
            'items': { '$ref': '#/$defs/couriers' }
        },
        'type': { 'type': 'string' },
    },
    '$defs': {
        'couriers': {
            'type': 'object',
            'properties': {
                'courierId': {
                    'type': 'integer'
                },
                'courier': {
                    'type': 'string'
                }
            }
        }
    },
    'v-security': {
        'allowGetAll': true,
        'publicFilter': ['id', 'data', 'type'],
        'publicJsonSchema': false,
    },
    'v-cache': false,
    'v-default-fields': ['id', 'data', 'type'],
    'v-indexed': ['id', 'data', 'type'],
}

export const SAVED_COURIERS_SCHEMA = {
    'properties': {
        'couriers': {
          'type': 'object'
        },
        'type': {'type': 'string'},
    },
    'v-security': {
        'allowGetAll': true,
        'publicFilter': ['id', 'couriers', 'type'],
        'publicJsonSchema': false,
    },
    'v-cache': false,
    'v-default-fields': ['id', 'couriers', 'type'],
    'v-indexed': ['id', 'couriers', 'type'],
}

