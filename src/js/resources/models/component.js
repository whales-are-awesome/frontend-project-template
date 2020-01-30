import $ from 'jquery'

import {observer} from '@js-res/helpers/observer'

export class Component {
	constructor(componentName, dataName = 'c') {
		const className = this.constructor.name
		
		if (className === 'Component') {
			throw Error('Cannot create an instance of an abstract class')
		}
		
		this.constructor.instances = this.constructor.instances || {}
		const instances = this.constructor.instances
		
		this.componentTag = className.toLowerCase()
		this.componentName = componentName
		this.$component = $(`.${this.componentTag}[data-${dataName}="${componentName}"]`)
		
		if (componentName in instances) return instances[componentName]
		else instances[componentName] = this.$component
	}
	
	get template() {
		if (template !== undefined) {
			return template.call(this)
		}
	}
	
	on(event, callback) {
		this._createEventListener(event)
		this.subscribe(event, callback)
	}
	
	_createEventListener(event) {
		if(!this.observers[event] || !this.observers[event].length) {
			const self = this
			
			this.$component.on(event, function(e) {
				self.notify(event, e, this)
			})
		}
	}
}

Object.assign(Component.prototype, observer)