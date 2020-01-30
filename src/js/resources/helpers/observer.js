export const observer =  {
	observers: [],
	
	subscribe(event, callback) {
		if (!this.observers[event]) this.observers[event] = []
		
		this.observers[event].push(callback)
	},
	
	unsubscribe(event, callback = null) {
		if (!callback) this.observers[event] = []
		
		this.observers[event] = this.observers[event].filter((observer) => callback !== callback)
		
		this.observers[event] = this.observers[event].filter((observer) => observer !== callback)
	},
	
	notify(event, data, self) {
		if (!this.observers[event]) this.observers[event] = []
		
		if(self) {
			this.observers[event].forEach(observer => observer.call(self, data))
		} else {
			this.observers[event].forEach(observer => observer(data))
		}
	}
}