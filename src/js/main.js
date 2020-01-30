import Router from 'navigo';

import {loadPageScript} from '@functions'


let root = document.location.origin,
	router = new Router(root)


loadPageScript('common')

router
.on('/', () => {
	loadPageScript('index')
})
.resolve()
