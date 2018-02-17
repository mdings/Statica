import '../sass/reset.scss'
import { h, app as _app } from 'hyperapp'

import { actions } from './actions'
import { state } from './state'
import { Titlebar } from '../projects/components';

const view = (state, actions) => (
    <div class="window">
        <Titlebar />
    </div>
)

// Bootstrap the app
const app = _app(state, actions, view, document.body)