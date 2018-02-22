import '../sass/components/titlebar.scss'
import '../sass/components/slide-pane.scss'
import '../sass/components/table.scss'
import '../sass/components/actionbar.scss'
import '../sass/components/activitybar.scss'

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
    <div class={isPaneActive ? 'slide-pane is-active' : 'slide-pane'}>
        {children}
    </div>
)

export const ActionBar = ({editButtonClick, remove, deploy}, children) => (
    <ul class="actionbar">
        <li onclick={editButtonClick}>Edit</li>
        <li onclick={remove}>Remove</li>
        <li onclick={deploy}>Deploy</li>
    </ul>
)

export const ActivityBar = ({message}) => {
    const className = message && message.length ? 'activitybar is-active' : 'activitybar'
    return (
        <div class={className}>{message}</div>
    )
}

const GithubPages = ({checkValidity, activeService}, button) => (
    <form>
        <input type="hidden" name="type" value="GithubPages" />
        <input required type="text" name="title" placeholder="title" oninput={checkValidity} value="test" value={activeService ? activeService['title'] : ''} />

        {button}
    </form>
)

const FTP = ({TextInput, checkValidity, activeService}, button) => (
    <form>
        <input type="hidden" name="type" value="FTP" />

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
        <input required type="password" name="password" oninput={checkValidity} />

        {button}
    </form>
)

export const Exporter = ({type, add, isButtonDisabled, checkValidity, activeService}) => {

    const Button = () => (
        <button class="confirm" onclick={add} disabled={isButtonDisabled}>Add Service</button>
    )

    const TextInput = ({name, placeholder, required="true"}) => (
        <input type="text" required={required == 'true' ? 'required' : ''} name={name} placeholder={placeholder} oninput={checkValidity} value={activeService ? activeService[name] : ''} />
    )

    switch (type) {
        case 'FTP':
            return (
                <FTP TextInput={TextInput} checkValidity={checkValidity} activeService={activeService}>
                    <Button/>
                </FTP>
            )
        case 'GithubPages':
            return (
                <GithubPages checkValidity={checkValidity} activeService={activeService}>
                    <Button/>
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