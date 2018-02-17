import '../sass/components/titlebar.scss'
import '../sass/components/project.scss'

import { h } from 'hyperapp'

export const Titlebar = ({openDialog}) => (
    <header>
        <button onclick={openDialog}>
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <path d="M61 37H43V19h-6v18H19v6h18v18h6V43h18"/>
            </svg>
        </button>
    </header>
)

export const StatusBar = ({projects}) => (
    <footer>
        Watching {projects.length} folders
    </footer>
)

export const Project = ({project, toggleFav, openMenu}) => (
    <li class="project">
        <svg class="project__favourite-toggle" onclick={() => toggleFav(project.id)} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd">
                <path d="M11.985 18.136L5.187 23l2.35-8.012L1 9.562l7.95-.07L11.985 1l2.95 8.562H23l-6.567 5.478 2.35 7.96-6.798-4.864z"/>
            </g>
        </svg>
        <span class="project__info">
            <span class="project__info__name">{project.name}</span>
            <span class="project__info__path">{project.path}</span>
        </span>
        <svg onclick={openMenu} class="project__actions" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h48v48H0z" fill="none"/>
            <path d="M24 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
        </svg>
    </li>
)