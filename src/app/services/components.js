import '../sass/components/titlebar.scss'

import { h } from 'hyperapp'

export const Titlebar = () => (
    <header>
        <button onclick={openDialog}>
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <path d="M61 37H43V19h-6v18H19v6h18v18h6V43h18"/>
            </svg>
        </button>
    </header>
)