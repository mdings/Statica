import '../sass/components/titlebar.scss'
import '../sass/components/slide-pane.scss'
import '../sass/components/table.scss'
import '../sass/components/actionbar.scss'
import '../sass/components/activitybar.scss'
import '../sass/components/inputs.scss'

import { h } from 'hyperapp'

export const Titlebar = ({addButtonClick, isPaneActive, project}) => (
    <header>
        <span class="title">{project.name}</span>
        <button onclick={addButtonClick}>
            <svg class={isPaneActive ? 'can-close' : ''} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <path d="M61 37H43V19h-6v18H19v6h18v18h6V43h18"/>
            </svg>
        </button>
    </header>
)

export const SlidePane = ({isPaneActive}, children) => (
    <div class={isPaneActive ? 'slide-pane is-active' : 'slide-pane'} data-slide-pane>
        {children}
    </div>
)

export const ActionBar = ({state, actions}, children) => (
    <div class={state.isActionsPanelActive ? `actionbar` : `actionbar is-disabled`}>
        <ul>
            <li onclick={e => actions.editButtonClick(e)}>
                <svg height="4px" version="1.1" viewBox="0 0 16 4" width="16px"><g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1"><g fill="#000000" id="Core" transform="translate(-130.000000, -346.000000)"><g id="more-horiz" transform="translate(130.000000, 346.000000)"><path d="M2,0 C0.9,0 0,0.9 0,2 C0,3.1 0.9,4 2,4 C3.1,4 4,3.1 4,2 C4,0.9 3.1,0 2,0 L2,0 Z M14,0 C12.9,0 12,0.9 12,2 C12,3.1 12.9,4 14,4 C15.1,4 16,3.1 16,2 C16,0.9 15.1,0 14,0 L14,0 Z M8,0 C6.9,0 6,0.9 6,2 C6,3.1 6.9,4 8,4 C9.1,4 10,3.1 10,2 C10,0.9 9.1,0 8,0 L8,0 Z" id="Shape"/></g></g></g></svg>
            </li>
            <li onclick={e => actions.remove()}>
                <svg height="14px" version="1.1" viewBox="0 0 14 14" width="14px"><g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1"><g fill="#000000" id="Core" transform="translate(-341.000000, -89.000000)"><g id="close" transform="translate(341.000000, 89.000000)"><path d="M14,1.4 L12.6,0 L7,5.6 L1.4,0 L0,1.4 L5.6,7 L0,12.6 L1.4,14 L7,8.4 L12.6,14 L14,12.6 L8.4,7 L14,1.4 Z" id="Shape"/></g></g></g></svg>
            </li>
            <li onclick={e => actions.deploy()}>
                <svg height="16px" version="1.1" viewBox="0 0 24 16" width="24px"><g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1"><g fill="#000000" id="Core" transform="translate(0.000000, -130.000000)"><g id="cloud-queue" transform="translate(0.000000, 130.000000)"><path d="M19.4,6 C18.7,2.6 15.7,0 12,0 C9.1,0 6.6,1.6 5.4,4 C2.3,4.4 0,6.9 0,10 C0,13.3 2.7,16 6,16 L19,16 C21.8,16 24,13.8 24,11 C24,8.4 21.9,6.2 19.4,6 L19.4,6 Z M19,14 L6,14 C3.8,14 2,12.2 2,10 C2,7.8 3.8,6 6,6 L6.7,6 C7.4,3.7 9.5,2 12,2 C15,2 17.5,4.5 17.5,7.5 L17.5,8 L19,8 C20.7,8 22,9.3 22,11 C22,12.7 20.7,14 19,14 L19,14 Z" id="Shape"/></g></g></g></svg>
            </li>
        </ul>
        {children}
    </div>
)

export const ActivityBar = ({message}) => {
    const className = message && message.length ? 'activitybar is-active' : 'activitybar'
    return (
        <div class={className}>
            <span>{message}</span>
            <span class="loader"></span>
        </div>
    )
}

const GithubPages = ({TextInput, checkValidity, fields}, button) => (
    <form>
        <label>Title</label>
        <TextInput name="title" placeholder="Title" />
        <label>Password</label>
        <TextInput name="password" />
        {button}
    </form>
)

const FTP = ({TextInput, checkValidity, active, fields}, button) => (
    <form>
        <label>Title</label>
        <TextInput name="title" placeholder="Title" />
        <label>Server</label>
        <TextInput name="host" placeholder="ftp.domain.com" />
        <label>Port (Optional)</label>
        <TextInput name="port" placeholder="80" required="false" />
        <label>Homedir (Optional)</label>
        <TextInput name="homedir" placeholder="/" required="false" />
        <label>Username</label>
        <TextInput name="username" />
        <label>Password</label>
        <TextInput name="password" />
        {button}
    </form>
)


export const Exporter = ({state, actions}) => {

    const TextInput = ({name, placeholder, required="true"}) => (
        <input type="text"
            required={required == 'true' ? 'required' : ''}
            name={name}
            placeholder={placeholder}
            oninput={e => actions.checkValidity(e)}
            value={state.fields[name] ? state.fields[name] : ''} />
    )

    const SubmitButton = () => (
        <button type="submit"
            onclick={state.inputMode == state.inputModes[1]
                ? e => actions.edit(e)
                : e => actions.add(e)}
            disabled={state.isButtonDisabled}>
            {state.inputMode == state.inputModes[1]
                ? `Update service`
                : `Add service` }
        </button>
    )

    switch (state.type) {
        case 'FTP':
            return (
                <FTP
                    TextInput={TextInput}
                    checkValidity={e => actions.checkValidity(e)}
                    active={state.active}
                    fields={state.fields}>
                    <SubmitButton />
                </FTP>
            )
        case 'GithubPages':
            return (
                <GithubPages
                    TextInput={TextInput}
                    checkValidity={e => actions.checkValidity(e)}
                    fields={state.fields}>
                    <SubmitButton />
                </GithubPages>
            )
    }
}

export const Table = ({cols}, rows) => (
    <ul class="table">
        <li>
            {cols.map(title => (
                <span>{title}</span>
            ))}
        </li>
        {rows}
    </ul>
)