import '../sass/components/titlebar.scss'
import '../sass/components/slide-pane.scss'
import '../sass/components/table.scss'
import '../sass/components/actionbar.scss'
import '../sass/components/activitybar.scss'
import '../sass/components/inputs.scss'

import { h } from 'hyperapp'

export const Titlebar = ({addButtonClick, isPaneActive, project}) => (
    <header>
        Deploying for: {project.name}
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
    <ul class={(state.items.length > 0 && state.active) ? `actionbar` : `actionbar is-disabled`}>
        <li onclick={e => actions.editButtonClick(e)}>Edit</li>
        <li onclick={e => actions.remove()}>Remove</li>
        <li onclick={e => actions.deploy()}>Deploy</li>
    </ul>
)

export const ActivityBar = ({message}) => {
    const className = message && message.length ? 'activitybar is-active' : 'activitybar'
    return (
        <div class={className}>{message}</div>
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