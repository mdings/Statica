import { h } from 'hyperapp'

export const Titlebar = ({openDialog}) => (
    <header style={{paddingTop: '50px'}}>
        <button onclick={openDialog}>
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <path d="M61 37H43V19h-6v18H19v6h18v18h6V43h18"/>
            </svg>
        </button>
    </header>
)

export const Project = ({project, toggleFav}) => (
    <li class="project">
        <svg class="favourite" style={{ height: '19px', width: 'auto' }} onclick={() => toggleFav(project.id)} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd">
                <path style={{ fill: '#ccc' }} d="M11.985 18.136L5.187 23l2.35-8.012L1 9.562l7.95-.07L11.985 1l2.95 8.562H23l-6.567 5.478 2.35 7.96-6.798-4.864z"/>
            </g>
        </svg>
        {project.name}
    </li>
)